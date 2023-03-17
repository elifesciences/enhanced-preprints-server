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
        publisherId,
        articleId,
      } = req.params;
      const doi = `${publisherId}/${articleId}`;

      const article = await repo.getArticle(doi);
      res.send({
        authors: article.authors,
        doi,
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
        publisherId,
        articleId,
      } = req.params;
      const doi = `${publisherId}/${articleId}`;

      const { content } = await repo.getArticle(doi);
      res.send(content);
    } catch (err) {
      next(err);
    }
  };

  const getReviewedPreprintReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        publisherId,
        articleId,
      } = req.params;
      const doi = `${publisherId}/${articleId}`;
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
