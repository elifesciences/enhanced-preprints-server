import express from 'express';
import { filesController } from '../controller/files-controller';

export const filesRoutes = () => {
  const router = express.Router();

  router.get('/api/files/:fileId(*)', filesController().downloadSupplementaryFile);

  return router;
};
