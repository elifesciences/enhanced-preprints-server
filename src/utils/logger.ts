import winston from 'winston';

const transport = new winston.transports.Console();
transport.level = process.env.LOG_LEVEL ?? 'debug';
winston.add(transport);
winston.format.combine(
  winston.format.json(),
  winston.format.colorize(),
);

export const logger = winston;
