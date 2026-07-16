/**
 * Catalyst Advanced I/O Function: ingestUpload
 *
 * Receives a file upload from a station's "Upload Records" screen,
 * stores it in Catalyst Stratus, logs an upload_batches row, and
 * triggers parseRecords (either directly, or — preferably — via a
 * Catalyst event-driven function bound to Stratus's "on file added"
 * event, which decouples upload from parsing).
 *
 * VERIFY against docs.catalyst.zoho.com — Stratus SDK method names
 * (bucket(), uploadFile()) are based on Catalyst's documented pattern
 * for file storage but the exact bucket/permission setup should be
 * confirmed against the current SDK version installed via
 * `npm install zcatalyst-sdk-node` before relying on this in prod.
 */

const catalyst = require('zcatalyst-sdk-node');
const { v4: uuidv4 } = require('uuid');

module.exports = async (context, basicIO) => {
	try {
		const app = catalyst.initialize(basicIO);
		const req = basicIO.getArgument('request') || basicIO;

		const stationId = req.body.station_id;
		const fileObject = req.body.file; // multipart file from the Upload Records UI

		if (!stationId || !fileObject) {
			basicIO.setStatus(400);
			basicIO.write(JSON.stringify({ error: 'station_id and file are required' }));
			return;
		}

		// 1. Store the raw file in Stratus, organized per-station/per-date
		//    so provenance (Section 5 of the spec) is always traceable.
		const stratus = app.stratus();
		const bucket = stratus.bucket('station-uploads');
		const stratusPath = `${stationId}/${new Date().toISOString().slice(0, 10)}/${fileObject.name}`;

		const uploadResult = await bucket.putObject(stratusPath, fileObject).start();

		// 2. Log the batch in Data Store — this row powers the
		//    Ingestion Command Center (Section 4.0.C).
		const datastore = app.datastore();
		const batchTable = datastore.table('upload_batches');

		const batchId = uuidv4();
		const formatDetected = detectFormat(fileObject.name);

		await batchTable.insertRow({
			batch_id: batchId,
			station_id: stationId,
			uploaded_at: new Date().toISOString(),
			file_name: fileObject.name,
			stratus_file_id: uploadResult.key || stratusPath,
			format_detected: formatDetected,
			records_parsed: 0,
			records_flagged: 0,
			status: 'uploaded',
		});

		// 3. Kick off parsing. Prefer wiring this as a Catalyst
		//    event-driven Function triggered on Stratus object-created
		//    events instead of calling it inline here — inline is shown
		//    for clarity/demo simplicity.
		// await catalyst.function('parseRecords').execute({ batch_id: batchId });

		basicIO.setStatus(200);
		basicIO.write(
			JSON.stringify({
				batch_id: batchId,
				format_detected: formatDetected,
				status: 'uploaded',
				message: 'File received. Parsing will begin shortly.',
			})
		);
	} catch (err) {
		basicIO.setStatus(500);
		basicIO.write(JSON.stringify({ error: err.message }));
	}
};

function detectFormat(fileName) {
	const ext = fileName.split('.').pop().toLowerCase();
	if (['csv'].includes(ext)) return 'csv';
	if (['xlsx', 'xls'].includes(ext)) return 'xlsx';
	if (['pdf'].includes(ext)) return 'pdf_scanned';
	if (['jpg', 'jpeg', 'png'].includes(ext)) return 'image_scanned';
	return 'unknown';
}
