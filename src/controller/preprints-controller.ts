import { NextFunction, Request, Response } from 'express';
import { ArticleRepository, EnhancedArticle } from '../model/model';
import { EnhancedArticleSchema } from '../http-schema/http-schema';
import { logger } from '../utils/logger';

export const preprintsController = (repo: ArticleRepository) => {
  const postPreprints = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, error } = EnhancedArticleSchema.validate(req.body, { abortEarly: false, allowUnknown: true });
      if (error) {
        res.status(400).send({
          result: false,
          message: `body sent failed validation: (${error.name}): ${error.message}`,
        });

        logger.error('validation failed for preprint', error);
        return;
      }

      // Inject headings into the article
      const article: EnhancedArticle = { ...req.body, article: { ...value.article } };

      const result = await repo.storeEnhancedArticle(article);
      if (!result) {
        res.status(500).send({
          result: false,
          message: 'Unable to save result to database',
        });
        return;
      }
      res.status(200).send({
        result: true,
        message: 'OK',
      });
    } catch (err) {
      next(err);
    }
  };

  const getPreprints = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const summaries = await repo.getEnhancedArticleSummaries();

      res.send({
        items: summaries,
        total: summaries.length,
      });
    } catch (err) {
      next(err);
    }
  };

  const getPreprintsByIdentifier = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const version = await repo.getArticleVersion(req.params.identifier);
      res.send(version);
    } catch (err) {
      next(err);
    }
  };

  return {
    postPreprints,
    getPreprints,
    getPreprintsByIdentifier,
  };
};
