import express from 'express';
import { ArticleRepository } from './model/model';
import { createArticleRepository } from './model/create-article-repository';
import { config } from './config';
import { logger } from './utils/logger';
import { createApp } from './app';

export const server = express();

let articleRepository: ArticleRepository;
createArticleRepository(config.repoType, config.repoConnection, config.repoUserName, config.repoPassword).then(async (repo: ArticleRepository) => {
  articleRepository = repo;
  createApp(articleRepository).listen(config.port, () => {
    logger.info(`EPP server is listening on port ${config.port}`);
  });
});
