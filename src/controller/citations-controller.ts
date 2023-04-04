import axios from 'axios';
import { NextFunction, Request, Response } from 'express';

export const citationsController = () => {
  const downloadBibtex = async (req: Request, res: Response, next: NextFunction) => {
    const {
      publisherId,
      articleId,
    } = req.params;
    const doi = `${publisherId}/${articleId}`;

    try {
      const extReq = await axios.get(
        `https://api.crossref.org/works/${doi}/transform/application/x-bibtex`,
      );

      // TODO: add fallback in case the DOI is not minted yet

      const bibtex = decodeURIComponent(extReq.data);

      if (bibtex) {
        res.set({ 'Content-Type': 'application/x-bibtex' });
        res.send(bibtex);
      } else {
        res.status(400);
      }
    } catch (err) {
      next(err);
    }
  };

  return {
    downloadBibtex,
  };
};
