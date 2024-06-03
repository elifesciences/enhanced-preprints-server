import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import express from 'express';
import { ArticleRepository } from './model/model';
import { config } from './config';
import { logger } from './utils/logger';
import { createApp } from './app';
import { createMongoDBArticleRepository } from './model/mongodb/mongodb-repository';

const provider = new NodeTracerProvider();
provider.register();

registerInstrumentations({
  instrumentations: [
    // Express instrumentation expects HTTP layer to be instrumented
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});

export const server = express();
let articleRepository: ArticleRepository;
createMongoDBArticleRepository(config.repoConnection, config.repoUserName, config.repoPassword).then(async (repo: ArticleRepository) => {
  articleRepository = repo;
  createApp(articleRepository).listen(config.port, () => {
    logger.info(`EPP server is listening on port ${config.port}`);
  });
});
