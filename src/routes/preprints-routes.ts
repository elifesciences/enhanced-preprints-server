import express from 'express';
import { preprintsController } from '../controller/preprints-controller';
import { ArticleRepository, EnhancedArticle } from '../model/model';

type ResponseBodyType = { result: boolean, message: string };

export const preprintsRoutes = (repo: ArticleRepository) => {
  const router = express.Router();

  router.get('/api/preprints/hashes', preprintsController(repo).getAllPreprintHashes);
  router.get('/api/preprints/:identifier', preprintsController(repo).getPreprintsByIdentifier);
  router.post<{}, ResponseBodyType, EnhancedArticle>('/preprints', preprintsController(repo).postPreprints);

  return router;
};
