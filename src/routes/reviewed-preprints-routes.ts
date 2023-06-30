import express from 'express';
import { reviewedPreprintsController } from '../controller/reviewed-preprints-controller';
import { ArticleRepository } from '../model/model';

export const reviewedPreprintsRoutes = (repo: ArticleRepository) => {
  const router = express.Router();

  router.get('/api/reviewed-preprints/', reviewedPreprintsController(repo).getReviewedPreprints);
  router.get('/api/reviewed-preprints/:id(*)/metadata', reviewedPreprintsController(repo).getReviewedPreprintMetadata);
  router.get('/api/reviewed-preprints/:id(*)/content', reviewedPreprintsController(repo).getReviewedPreprintContent);
  router.get('/api/reviewed-preprints/:id(*)/reviews', reviewedPreprintsController(repo).getReviewedPreprintReviews);

  return router;
};
