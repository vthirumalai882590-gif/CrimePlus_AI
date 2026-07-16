let hasCrashed = false;
let crashError = null;

function handleCrash(err) {
  if (hasCrashed) return;
  hasCrashed = true;
  crashError = err;
  
  console.error('CRITICAL PROCESS CRASH DETECTED:', err);
  
  try {
    const express = require('express');
    const app = express();
    const port = process.env.X_ZOHO_CATALYST_LISTEN_PORT || process.env.PORT || 5000;
    
    app.all('*', (req, res) => {
      res.status(200).json({
        diagnostic: 'CRASH_ON_STARTUP',
        error: crashError.message || crashError.toString(),
        stack: crashError.stack || 'No stack trace available.',
        env: {
          platform: process.platform,
          node_version: process.version,
          listen_port: process.env.X_ZOHO_CATALYST_LISTEN_PORT,
          cwd: process.cwd()
        }
      });
    });
    
    app.listen(port, () => {
      console.log(`Diagnostic server successfully listening on port ${port}`);
    });
  } catch (diagErr) {
    console.error('Failed to launch diagnostic server:', diagErr.message);
  }
}

// Intercept all async errors
process.on('uncaughtException', (err) => {
  handleCrash(err);
});

process.on('unhandledRejection', (reason) => {
  handleCrash(reason instanceof Error ? reason : new Error(String(reason)));
});

console.log('Launching Express Server Wrapper...');

try {
  require('./dist/server.js');
} catch (err) {
  handleCrash(err);
}
