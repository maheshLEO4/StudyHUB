/**
 * Winston Logger — structured logging for all environments
 */
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, errors, json, colorize, simple } = format;

const isProd = process.env.NODE_ENV === 'production';

const logger = createLogger({
  level: isProd ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'studyhub-api' },
  transports: [
    new transports.Console({
      format: isProd ? json() : combine(colorize(), simple()),
    }),
    ...(isProd ? [
      new transports.File({ filename: 'logs/error.log', level: 'error' }),
      new transports.File({ filename: 'logs/combined.log' }),
    ] : []),
  ],
});

module.exports = logger;
