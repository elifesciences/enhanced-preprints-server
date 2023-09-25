import { NextFunction, Request, Response } from 'express';
import axios from 'axios';
import { EnhancedArticleSchema } from '../http-schema/http-schema';
import { ArticleRepository } from '../model/model';
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
      const result = await repo.storeEnhancedArticle(value);
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
      const version = await repo.findArticleVersion(req.params.identifier);
      if (!version) {
        logger.info(`Cannot find a matching article version (${req.params.identifier})`);
        res.status(404).send({
          result: false,
          message: `no result found for: (${req.params.identifier})`,
        });
      } else {
        const { msid, versionIdentifier } = version.article;
        const pdfUrl = `https://github.com/elifesciences/enhanced-preprints-data/raw/master/data/${msid}/v${versionIdentifier}/${msid}-v${versionIdentifier}.pdf`;
        try {
          const { status } = await axios.get(pdfUrl);
          if (status === 200) {
            version.article.pdfUrl = pdfUrl;
          }
        } finally {
          res.send(version);
        }
      }
    } catch (err) {
      next(err);
    }
  };

  const deletePreprintByIdentifier = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deleteResult = await repo.deleteArticleVersion(req.params.identifier);
      if (deleteResult) res.sendStatus(200);
      else res.status(404).send('Article not found');
    } catch (err) {
      next(err);
    }
  };

  return {
    postPreprints,
    getPreprints,
    getPreprintsByIdentifier,
    deletePreprintByIdentifier,
  };
};
