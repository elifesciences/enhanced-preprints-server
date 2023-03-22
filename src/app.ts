import express from 'express';
import { ArticleRepository } from './model/model';
import { baseRoutes } from './routes/base-routes';
import { reviewedPreprintsRoutes } from './routes/reviewed-preprints-routes';
import { importRoutes } from './routes/import-routes';
import { preprintsRoutes } from './routes/preprints-routes';
import { citationsRoutes } from './routes/citations-routes';

export const createApp = (repo: ArticleRepository, config: Record<string, any>) => {
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

  app.use(baseRoutes());
  app.use(reviewedPreprintsRoutes(repo, config));
  app.use(preprintsRoutes(repo));
  app.use(importRoutes(repo));
  app.use(citationsRoutes(repo));

  return app;
};
