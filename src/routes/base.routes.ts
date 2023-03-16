import express from 'express';
import { baseController } from '../controller/base.controller';

export const baseRoutes = () => {
  const router = express.Router();

  router.get('/', baseController().getBase);

  return router;
};
