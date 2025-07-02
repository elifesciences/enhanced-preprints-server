import express from 'express';

export const downloadsRoutes = () => {
  const router = express.Router();

  router.get('/api/downloads/:msid/:versionIdentifier/pdf');

  return router;
};
