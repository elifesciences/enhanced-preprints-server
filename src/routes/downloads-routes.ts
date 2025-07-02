import express from 'express';

export const downloadsRoutes = () => {
  const router = express.Router();

  router.get('/api/downloads/:articleId/pdf');

  return router;
};
