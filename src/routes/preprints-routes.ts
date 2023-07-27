import express from 'express';
import { preprintsController } from '../controller/preprints-controller';
import { ArticleRepository, EnhancedArticle, VersionedArticle } from '../model/model';

type ResponseBodyType = { result: boolean, message: string };

export const preprintsRoutes = (repo: ArticleRepository) => {
  const router = express.Router();

  router.get('/api/preprints/', preprintsController(repo).getPreprints);
  router.get('/api/preprints/:identifier(*)', preprintsController(repo).getPreprintsByIdentifier);
  router.post<{}, ResponseBodyType, VersionedArticle>('/preprints', preprintsController(repo).postPreprints);
  router.delete('/preprints/:identifier(*)', preprintsController(repo).deletePreprintByIdentifier);

  return router;
};
