import express from 'express';
import { type ArticleRepository } from './model/model';
import { config } from './config';
import { logger } from './utils/logger';
import { createApp } from './app';
import { createMongoDBArticleRepository } from './model/mongodb/mongodb-repository';

export const server = express();
let articleRepository: ArticleRepository;
createMongoDBArticleRepository(config.repoConnection, config.repoUserName, config.repoPassword).then(async (repo: ArticleRepository) => {
  articleRepository = repo;
  createApp(articleRepository).listen(config.port, () => {
    logger.info(`EPP server is listening on port ${config.port}`);
  });
});
