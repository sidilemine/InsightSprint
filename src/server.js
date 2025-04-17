const app = require('./app');
const config = require('./config/config');
const { connectDB } = require('./utils/db');
const { setupLogging } = require('./utils/logger');

const logger = setupLogging();

// Create uploads directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const uploadDir = path.join(__dirname, '..', config.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  logger.info(`Created uploads directory: ${uploadDir}`);
}

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  logger.info(`Created logs directory: ${logsDir}`);
}

// Connect to database
connectDB()
  .then(() => {
    // Start the server
    const server = app.listen(config.PORT, () => {
      logger.info(`Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      logger.error(`Unhandled Rejection: ${err.message}`);
      logger.error(err.stack);
      // Close server & exit process
      server.close(() => process.exit(1));
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error(`Uncaught Exception: ${err.message}`);
      logger.error(err.stack);
      // Close server & exit process
      server.close(() => process.exit(1));
    });
  })
  .catch(err => {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  });
