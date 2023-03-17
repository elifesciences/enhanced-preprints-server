import express from 'express';
import { reviewedPreprintsController } from '../controller/reviewed-preprints.controller';
import { ArticleRepository } from '../model/model';

export const reviewedPreprintsRoutes = (repo: ArticleRepository, config: Record<string, any>) => {
  const router = express.Router();

  router.get('/api/reviewed-preprints/', reviewedPreprintsController(repo, config).getReviewedPreprints);
  router.get('/api/reviewed-preprints/:publisherId/:articleId/metadata', reviewedPreprintsController(repo, config).getReviewedPreprintMetadata);
  router.get('/api/reviewed-preprints/:publisherId/:articleId/content', reviewedPreprintsController(repo, config).getReviewedPreprintContent);
  router.get('/api/reviewed-preprints/:publisherId/:articleId/reviews', reviewedPreprintsController(repo, config).getReviewedPreprintReviews);

  return router;
};
