import express from 'express';
import { ArticleRepository } from './model/model';
import { preprintsRoutes } from './routes/preprints-routes';
import { citationsRoutes } from './routes/citations-routes';
import { filesRoutes } from './routes/files-routes';

export const createApp = (repo: ArticleRepository) => {
  const app = express();

  app.use(express.json({ limit: '5mb' }));

  // error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const errorHandler: express.ErrorRequestHandler = (error, req, res, next) => {
    const status = error.status || 500;
    const message = error.message || 'Something went wrong';
    res.status(status)
      .send({
        status,
        message,
      });
  };
  app.use(errorHandler);

  app.use(preprintsRoutes(repo));
  app.use(filesRoutes());
  app.use(citationsRoutes());

  return app;
};
