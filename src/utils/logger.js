const winston = require('winston');
const config = require('../config/config');

/**
 * Setup application logging
 * @returns {winston.Logger} Configured logger instance
 */
function setupLogging() {
  const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  );

  const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ level, message, timestamp, ...meta }) => {
      return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    })
  );

  const logger = winston.createLogger({
    level: config.LOG_LEVEL,
    format: logFormat,
    defaultMeta: { service: 'rapid-sentiment-analysis' },
    transports: [
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' })
    ]
  });

  // If we're not in production, also log to the console
  if (config.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: consoleFormat
    }));
  }

  return logger;
}

module.exports = {
  setupLogging
};
