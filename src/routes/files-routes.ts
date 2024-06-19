import express from 'express';
import { filesController } from '../controller/files-controller';
import { ArticleRepository } from '../model/model';

export const filesRoutes = (repo: ArticleRepository) => {
  const router = express.Router();

  router.get('/api/preprints/:identifier(*)/:fileId(*)', filesController(repo).downloadSupplementaryFile);

  return router;
};
