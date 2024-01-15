import { NextFunction, Request, Response } from 'express';
import { loadXmlArticlesFromS3IntoStores } from '../services/data-loader/data-loader';
import { ArticleRepository } from '../model/model';

export const importController = (repo: ArticleRepository) => {
  const getImport = async (req: Request, res: Response) => {
    res.send(`<form method="POST">
    <input type="submit" value="import">
  </form>`);
  };

  const postImport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const results = await loadXmlArticlesFromS3IntoStores(repo);
      if (results.length === 0) {
        res.send({
          status: false,
          message: 'No files were imported',
        });
      } else if (results.every((value) => value)) {
        res.send({
          status: true,
          message: 'Import completed',
        });
      } else {
        res.send({
          status: false,
          message: 'Some items did not import',
        });
      }
    } catch (err) {
      next(err);
    }
  };

  return {
    getImport,
    postImport,
  };
};
