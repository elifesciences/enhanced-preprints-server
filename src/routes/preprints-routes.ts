import express from 'express';
import { preprintsController } from '../controller/preprints-controller';
import { ArticleRepository, EnhancedArticle } from '../model/model';

type ResponseBodyType = { result: boolean, message: string };

export const preprintsRoutes = (repo: ArticleRepository) => {
  const router = express.Router();

  router.get('/api/preprints/', preprintsController(repo).getPreprints);
  router.get('/api/preprints/:identifier(*)', preprintsController(repo).getPreprintsByIdentifier);
  router.get('/api/preprints-no-content/', preprintsController(repo).getEnhancedArticlesNoContent);
  router.post<{}, ResponseBodyType, EnhancedArticle>('/preprints', preprintsController(repo).postPreprints);
  router.delete('/preprints/:identifier(*)', preprintsController(repo).deletePreprintByIdentifier);

  return router;
};
