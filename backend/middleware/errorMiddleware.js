import { Logging } from '@google-cloud/logging';

// Setup Google Cloud Logging
const logging = new Logging();
const log = logging.log('agentEcos-api-errors');

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log error to Google Cloud Logging
  const metadata = {
    resource: { type: 'global' },
    severity: 'ERROR',
  };
  
  const entry = log.entry(metadata, {
    message: err.message,
    stack: err.stack,
    requestPath: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
  
  log.write(entry);
  
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};