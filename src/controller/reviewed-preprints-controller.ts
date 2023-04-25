import { NextFunction, Request, Response } from 'express';
import { ArticleRepository } from '../model/model';
import { fetchReviews } from '../services/reviews/fetch-reviews';

export const reviewedPreprintsController = (repo: ArticleRepository, config: Record<string, any>) => {
  const getReviewedPreprints = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const summaries = await repo.getArticleSummaries();

      res.send({
        items: summaries,
        total: summaries.length,
      });
    } catch (err) {
      next(err);
    }
  };

  const getReviewedPreprintMetadata = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        id,
      } = req.params;

      const article = await repo.getArticle(id);
      res.send({
        authors: article.authors,
        doi: article.doi,
        title: article.title,
        msas: [],
        importance: '',
        strengthOfEvidence: '',
        views: 1,
        citations: 2,
        tweets: 3,
        headings: article.headings,
        abstract: article.abstract,
        references: article.references,
      });
    } catch (err) {
      next(err);
    }
  };

  const getReviewedPreprintContent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        id,
      } = req.params;

      const { content } = await repo.getArticle(id);
      res.send(content);
    } catch (err) {
      next(err);
    }
  };

  const getReviewedPreprintReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        id,
      } = req.params;

      const { doi } = await repo.getArticle(id);
      res.send(await fetchReviews(doi, config.id));
    } catch (err) {
      next(err);
    }
  };

  return {
    getReviewedPreprints,
    getReviewedPreprintMetadata,
    getReviewedPreprintContent,
    getReviewedPreprintReviews,
  };
};
