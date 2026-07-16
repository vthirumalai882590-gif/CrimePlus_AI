#!/bin/sh
echo "=== Installing python dependencies ==="
/var/lang/bin/python3 -m pip install -r requirements.txt
echo "=== Starting FastAPI Server ==="
/var/lang/bin/python3 -m uvicorn app.main:app --host 0.0.0.0 --port $X_ZOHO_CATALYST_LISTEN_PORT
