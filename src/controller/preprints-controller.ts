import { NextFunction, Request, Response } from 'express';
import axios from 'axios';
import { PreprintsControllerSchema } from '../http-schema/http-schema';
import { ArticleRepository } from '../model/model';
import { logger } from '../utils/logger';
import { config } from '../config';

export const preprintsController = (repo: ArticleRepository) => {
  const postPreprints = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { value, warning, error } = PreprintsControllerSchema.validate(req.body, { abortEarly: false, allowUnknown: true });
      if (error) {
        res.status(400).send({
          result: false,
          message: 'validation failed',
          error,
          warning,
        });

        logger.error('validation failed for preprint', { error, warning });
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

      if (warning) {
        logger.warn('validation had warnings for preprint', warning);
      }
      res.status(200).send({
        result: true,
        message: 'OK',
        warning,
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
      const version = await repo.findArticleVersion(req.params.identifier, req.query.previews !== undefined);
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
        } catch (err) {
          // eslint-disable-next-line no-console
          console.log('no PDF found or fetch failed');
        }

        if (config.elifeMetricsUrl) {
          const metricsSummaryUrl = `${config.elifeMetricsUrl}/metrics/article/${msid}/summary`;
          try {
            const { data } = await axios.get(metricsSummaryUrl);
            const metrics = data.items[0];
            version.metrics = {
              views: metrics.views,
              downloads: metrics.downloads,
              citations: Math.max(metrics.crossref, metrics.pubmed, metrics.scopus),
            };
          } catch (err) {
            logger.error(`USE_ELIFE_METRICS configured, but request for ${metricsSummaryUrl} failed`);
          }
        }

        if (version.article.msid === '85111') {
          version.versions = {
            '85111v3': {
              id: '85111v3',
              msid: '85111',
              versionIdentifier: '3',
              published: new Date('2023-06-07T00:00:00.000Z'),
              url: 'https://elifesciences.org/articles/85111v1',
            },
            ...version.versions,
          };
        }
        res.send(version);
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

  const getEnhancedArticlesNoContent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const order = req.query.order as 'asc' | 'desc' || 'desc';
      const page = parseInt(req.query.page as string, 10) || null;
      const perPage = parseInt(req.query['per-page'] as string, 10) || null;
      const startDate = req.query['start-date'] as string || null;
      const endDate = req.query['end-date'] as string || null;
      const useDate = req.query['use-date'] as 'firstPublished' || null;

      const { articles, totalCount } = await repo.getEnhancedArticlesNoContent(page, perPage, order, startDate, endDate, useDate);

      res.set('X-Total-Count', totalCount.toString());

      res.send(articles);
    } catch (err) {
      next(err);
    }
  };

  return {
    postPreprints,
    getPreprints,
    getPreprintsByIdentifier,
    deletePreprintByIdentifier,
    getEnhancedArticlesNoContent,
  };
};
