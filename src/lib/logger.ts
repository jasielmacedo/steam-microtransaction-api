import winston from 'winston';

const logger = winston.createLogger({
  format:
    process.env.NODE_ENV === 'development'
      ? winston.format.combine(
          winston.format.splat(),
          winston.format.prettyPrint({ colorize: true })
        )
      : winston.format.combine(winston.format.splat(), winston.format.simple()),
  level: process.env.DEBUG ?? 'info',

  transports: [new winston.transports.Console()],
  exitOnError: false,
  silent: false,
});

export default logger;
