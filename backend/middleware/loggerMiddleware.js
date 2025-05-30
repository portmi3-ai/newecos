export const requestLogger = (log) => {
  return (req, res, next) => {
    const startTime = new Date();
    
    res.on('finish', () => {
      const duration = new Date() - startTime;
      
      const metadata = {
        resource: { type: 'global' },
        severity: 'INFO',
      };
      
      const logEntry = {
        requestPath: req.originalUrl,
        method: req.method,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        timestamp: new Date().toISOString(),
      };
      
      // Don't log health check requests
      if (req.originalUrl !== '/health') {
        const entry = log.entry(metadata, logEntry);
        log.write(entry);
      }
    });
    
    next();
  };
};