import { Response, Request, Router } from 'express';

export const filesRoutes = () => {
  const router = Router();

  router.get('/api/files/:fileId(*)', async (req: Request, res: Response) => {
    res.status(404).send('File not found');
  });

  return router;
};
