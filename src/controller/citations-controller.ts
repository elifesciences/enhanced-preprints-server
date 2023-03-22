import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import { ArticleRepository } from '../model/model';

export const citationsController = (repo: ArticleRepository) => {
  const downloadBibtex = async (req: Request, res: Response, next: NextFunction) => {
    const {
      publisherId,
      articleId,
    } = req.params;
    const doi = `${publisherId}/${articleId}`;

    if (await repo.getArticle(doi)) {
      try {
        const extReq = await axios.get(
          `https://api.crossref.org/works/${doi}/transform/application/x-bibtex`,
        );

        const bibtex = decodeURI(extReq.data);

        if (bibtex) {
          res.set({ 'Content-Type': 'application/x-bibtex' });
          res.send(bibtex);
        } else {
          res.status(400);
        }
      } catch (err) {
        next(err);
      }
    } else {
      res.status(404);
    }
  };

  return {
    downloadBibtex,
  };
};
