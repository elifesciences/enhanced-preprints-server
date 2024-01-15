import express from 'express';
import { importController } from '../controller/import-controller';
import { ArticleRepository } from '../model/model';

export const importRoutes = (repo: ArticleRepository) => {
  const router = express.Router();

  router.get('/import', importController(repo).getImport);
  router.post('/import', importController(repo).postImport);

  return router;
};
