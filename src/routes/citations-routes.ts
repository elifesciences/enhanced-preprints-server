import express from 'express';
import { citationsController } from '../controller/citations-controller';

export const citationsRoutes = () => {
  const router = express.Router();

  router.get('/api/citations/:publisherId/:articleId/bibtex', citationsController().downloadBibtex);

  return router;
};
