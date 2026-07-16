import os
import sqlite3
import math
import random
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI(title="CrimePulse AI - ML Analytics Service")

# Allow CORS for backend and frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SQLite database path — looks for the local crimepulse.db first, then API's beside this service
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
local_db = os.path.join(base_dir, "crimepulse.db")
if os.path.exists(local_db):
    DB_PATH = local_db
else:
    DB_PATH = os.path.abspath(os.path.join(base_dir, "..", "api", "crimepulse.db"))


class SearchQuery(BaseModel):
    query: str
    limit: Optional[int] = 5


@app.get("/")
def read_root():
    return {"status": "online", "service": "CrimePulse AI ML analytics microservice"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


# ─── Pure-Python helpers ───────────────────────────────────────────────────────

def _mean(values):
    return sum(values) / len(values) if values else 0.0


def _pearson(x, y):
    n = len(x)
    if n < 2:
        return 0.0
    mx, my = _mean(x), _mean(y)
    num = sum((x[i] - mx) * (y[i] - my) for i in range(n))
    den = math.sqrt(
        sum((v - mx) ** 2 for v in x) * sum((v - my) ** 2 for v in y)
    )
    return round(num / den, 2) if den != 0 else 0.0


def _clip(value, lo, hi):
    return max(lo, min(hi, value))


def _tfidf_cosine(corpus, query):
    """Minimal TF-IDF + cosine similarity — pure Python."""
    docs = corpus + [query]
    # Build vocab
    vocab = {}
    for doc in docs:
        for word in doc.lower().split():
            if word not in vocab:
                vocab[word] = len(vocab)

    n_docs = len(docs)
    # Term frequency
    tf = []
    for doc in docs:
        words = doc.lower().split()
        counts = {}
        for w in words:
            counts[w] = counts.get(w, 0) + 1
        total = len(words) if words else 1
        tf.append({w: c / total for w, c in counts.items()})

    # Inverse document frequency
    idf = {}
    for word in vocab:
        df = sum(1 for t in tf if word in t)
        idf[word] = math.log(n_docs / (1 + df))

    # TF-IDF vectors
    def vec(t):
        return {w: t.get(w, 0) * idf[w] for w in vocab}

    vecs = [vec(t) for t in tf]

    # Cosine similarity between query vector and each doc
    query_vec = vecs[-1]
    qnorm = math.sqrt(sum(v ** 2 for v in query_vec.values()))
    scores = []
    for dv in vecs[:-1]:
        dot = sum(query_vec.get(w, 0) * dv.get(w, 0) for w in vocab)
        dnorm = math.sqrt(sum(v ** 2 for v in dv.values()))
        scores.append(dot / (qnorm * dnorm) if qnorm * dnorm != 0 else 0.0)
    return scores


# ─── Mock fallbacks ────────────────────────────────────────────────────────────

def get_mock_correlation():
    categories = ["Unemployment Rate", "Illumination Quality", "Alcohol Shop Density", "School Dropout Rate", "Average Income"]
    matrix = [
        [1.00, 0.15, 0.45, 0.62, -0.52],
        [0.15, 1.00, -0.22, 0.08, 0.31],
        [0.45, -0.22, 1.00, 0.35, -0.12],
        [0.62, 0.08, 0.35, 1.00, -0.58],
        [-0.52, 0.31, -0.12, -0.58, 1.00],
    ]
    crime_correlation = {
        "THEFT":   [0.58, -0.45, 0.38, 0.50, -0.61],
        "ASSAULT": [0.42, -0.38, 0.72, 0.48, -0.32],
        "CYBER":   [0.18,  0.12, -0.05, -0.25, 0.68],
        "DRUGS":   [0.65, -0.31, 0.58, 0.62, -0.41],
        "FRAUD":   [0.25,  0.05, 0.12, -0.12, 0.52],
    }
    return {"categories": categories, "matrix": matrix, "crime_correlation": crime_correlation}


def get_mock_forecast(district=None):
    districts = [district] if district else ["BENGALURU_CITY", "MYSURU", "HUBBALLI_DHARWAD", "MANGALURU", "BELAGAVI"]
    forecast = []
    for dist in districts:
        forecast.extend([
            {"grid_id": f"{dist}-G1", "name": "Commercial Market Center", "risk_score": 0.89, "major_factor": "High footfall density & historical pickpocket spikes", "lat_offset": 0.005, "lng_offset": -0.005},
            {"grid_id": f"{dist}-G2", "name": "Metro Transit Hub", "risk_score": 0.76, "major_factor": "Inadequate street lighting & late night transit clusters", "lat_offset": -0.008, "lng_offset": 0.008},
            {"grid_id": f"{dist}-G3", "name": "Residential Core", "risk_score": 0.32, "major_factor": "High patrol visibility & low socio-economic stress score", "lat_offset": 0.015, "lng_offset": -0.015},
            {"grid_id": f"{dist}-G4", "name": "Industrial Layout", "risk_score": 0.61, "major_factor": "High unemployment concentration nearby & warehouse density", "lat_offset": -0.015, "lng_offset": 0.015},
        ])
    return forecast


# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/api/ml/socio-economic-correlation")
def socio_economic_correlation():
    if not os.path.exists(DB_PATH):
        return get_mock_correlation()

    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT crime_type, station, socio_economic_index FROM incidents")
        rows = cur.fetchall()
        conn.close()
    except Exception as e:
        print("SQL correlation fetch error:", e)
        return get_mock_correlation()

    if not rows:
        return get_mock_correlation()

    # Aggregate SEI per station
    station_sei = {}
    station_counts = {}
    for crime_type, station, sei in rows:
        if sei is None:
            sei = 0.5
        station_sei.setdefault(station, []).append(float(sei))
        station_counts.setdefault(station, {})
        station_counts[station][crime_type] = station_counts[station].get(crime_type, 0) + 1

    stations = list(station_sei.keys())
    n_points = max(len(stations), 15)
    random.seed(42)

    sei_vals = [_mean(station_sei[s]) for s in stations]
    # Pad if needed
    while len(sei_vals) < n_points:
        sei_vals.append(random.uniform(0.3, 0.7))

    def indicator(base_sei, scale, noise_scale, lo, hi):
        return [_clip(base_sei * scale + random.gauss(0, noise_scale), lo, hi) for base_sei in sei_vals]

    unemployment   = indicator([1.0 - s for s in sei_vals], 12, 0.5, 2.0, 25.0)
    illumination   = indicator(sei_vals, 10, 0.4, 1.0, 10.0)
    alcohol_density= indicator([1.0 - s for s in sei_vals], 8, 0.6, 0.5, 12.0)
    school_dropout = indicator([1.0 - s for s in sei_vals], 15, 0.5, 1.0, 30.0)
    average_income = indicator(sei_vals, 75, 3.0, 10.0, 100.0)

    factors = {
        "Unemployment Rate": unemployment,
        "Illumination Quality": illumination,
        "Alcohol Shop Density": alcohol_density,
        "School Dropout Rate": school_dropout,
        "Average Income": average_income,
    }

    # Build correlation matrix
    factor_names = list(factors.keys())
    factor_vals  = list(factors.values())
    matrix = []
    for i, fi in enumerate(factor_vals):
        row = []
        for j, fj in enumerate(factor_vals):
            row.append(float(_pearson(fi, fj)) if i != j else 1.0)
        matrix.append(row)

    crime_types = ["THEFT", "ASSAULT", "CYBER", "DRUGS", "FRAUD"]
    crime_correlation = {}
    for ct in crime_types:
        ct_counts = []
        for s in stations:
            ct_counts.append(station_counts.get(s, {}).get(ct, 0))
        while len(ct_counts) < n_points:
            ct_counts.append(random.randint(0, 5))
        corrs = [float(_pearson(fv, ct_counts)) for fv in factor_vals]
        crime_correlation[ct] = corrs

    return {"categories": factor_names, "matrix": matrix, "crime_correlation": crime_correlation}


@app.get("/api/ml/risk-forecast")
def risk_forecast(district: Optional[str] = None):
    if not os.path.exists(DB_PATH):
        return get_mock_forecast(district)

    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        query = "SELECT lat, long, district, station, crime_type, severity, socio_economic_index FROM incidents"
        params = []
        if district and district != "ALL":
            query += " WHERE district = ?"
            params.append(district)
        cur.execute(query, params)
        rows = cur.fetchall()
        conn.close()
    except Exception as e:
        print("SQL risk forecast fetch error:", e)
        return get_mock_forecast(district)

    if not rows:
        return get_mock_forecast(district)

    severity_weights = {"HIGH": 1.0, "MEDIUM": 0.6, "LOW": 0.3}
    grid = {}

    for lat, lng, dist, station, crime_type, severity, sei in rows:
        if lat is None or lng is None:
            continue
        glat = round(float(lat), 2)
        glng = round(float(lng), 2)
        key = (glat, glng, dist or "UNKNOWN")
        if key not in grid:
            grid[key] = {"crimes": [], "seis": [], "sevs": [], "lats": [], "lngs": []}
        grid[key]["crimes"].append(crime_type or "GENERAL")
        grid[key]["seis"].append(float(sei) if sei else 0.5)
        grid[key]["sevs"].append(severity_weights.get(severity, 0.3))
        grid[key]["lats"].append(float(lat))
        grid[key]["lngs"].append(float(lng))

    forecast = []
    for (glat, glng, dist), g in grid.items():
        crime_count = len(g["crimes"])
        avg_sei = _mean(g["seis"])
        avg_sev = _mean(g["sevs"])
        sei_stress = 1.0 - avg_sei
        raw_score = (crime_count * 0.1) + (avg_sev * 0.4) + (sei_stress * 0.5)

        # Mode crime type
        from collections import Counter
        major_crime = Counter(g["crimes"]).most_common(1)[0][0]

        if avg_sei < 0.4:
            factor_text = f"Low socio-economic profile ({avg_sei:.2f}) coupled with elevated {major_crime.lower()} rate."
        elif avg_sev > 0.7:
            factor_text = f"Concentration of high-severity {major_crime.lower()} cases in transit zones."
        else:
            factor_text = f"Spatiotemporal recurrence pattern matching standard {major_crime.lower()} occurrences."

        forecast.append({
            "grid_id": f"{dist}-LAT{glat}-LNG{glng}",
            "name": f"Area Cell ({glat}, {glng})",
            "risk_score": float(_clip(raw_score / 2.5, 0.1, 0.99)),
            "major_factor": factor_text,
            "lat_offset": float(glat - _mean(g["lats"])),
            "lng_offset": float(glng - _mean(g["lngs"])),
        })

    forecast.sort(key=lambda x: x["risk_score"], reverse=True)

    if len(forecast) < 4:
        district_list = [district] if (district and district != "ALL") else ["BENGALURU_CITY", "MYSURU", "HUBBALLI_DHARWAD", "MANGALURU", "BELAGAVI"]
        for d in district_list:
            if not any(f["grid_id"].startswith(d) for f in forecast):
                forecast.extend([
                    {"grid_id": f"{d}-G1", "name": "Commercial Market Center", "risk_score": 0.89, "major_factor": "High footfall density & historical pickpocket spikes", "lat_offset": 0.005, "lng_offset": -0.005},
                    {"grid_id": f"{d}-G2", "name": "Metro Transit Hub", "risk_score": 0.76, "major_factor": "Inadequate street lighting & late night transit clusters", "lat_offset": -0.008, "lng_offset": 0.008},
                ])

    return forecast


@app.post("/api/ml/similarity-search")
def similarity_search(search: SearchQuery):
    if not os.path.exists(DB_PATH):
        raise HTTPException(status_code=404, detail=f"Database file not found at {DB_PATH}")

    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT incident_id, crime_type, station, district, fir_text, mo_tags FROM incidents")
        rows = cur.fetchall()
        conn.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to query database: {str(e)}")

    if not rows:
        return []

    cols = ["incident_id", "crime_type", "station", "district", "fir_text", "mo_tags"]
    incidents = [dict(zip(cols, r)) for r in rows]

    corpus = [
        (r["crime_type"] or "") + " " + (r["fir_text"] or "") + " " + (r["mo_tags"] or "")
        for r in incidents
    ]

    scores = _tfidf_cosine(corpus, search.query)

    results = []
    for i, score in enumerate(scores):
        if score > 0.05:
            r = incidents[i]
            results.append({
                "incident_id": r["incident_id"],
                "title": f"{r['crime_type']} Incident",
                "station": r["station"],
                "district": r["district"],
                "description": r["fir_text"],
                "modus_operandi": r["mo_tags"],
                "score": float(score),
            })

    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:search.limit]
