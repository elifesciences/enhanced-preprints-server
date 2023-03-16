import express from 'express';
import { preprintsController } from '../controller/preprints.controller';
import { ArticleRepository, EnhancedArticle } from '../model/model';

export const preprintsRoutes = (repo: ArticleRepository) => {
  const router = express.Router();

  router.get('/api/preprints/:identifier', preprintsController(repo).getPreprintsByIdentifier);
  router.post<{}, { result: boolean, message: string }, EnhancedArticle>('/api/preprints', preprintsController(repo).postPreprints);

  return router;
};
