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
  createApp(articleRepository).listen(3000, () => {
    logger.info('Example app listening on port 3000');
  });
});
