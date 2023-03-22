import express from 'express';
import { citationsController } from '../controller/citations-controller';
import { ArticleRepository } from '../model/model';

export const citationsRoutes = (repo: ArticleRepository) => {
  const router = express.Router();

  router.get('/api/citations/:publisherId/:articleId/bibtex', citationsController(repo).downloadBibtex);

  return router;
};
