import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import { ArticleRepository } from '../model/model';
import { constructEPPVersionS3FilePath, getPresignedDownloadUrl, getS3Client } from '../utils/s3';
import { config } from '../config';

export const filesController = (repo: ArticleRepository) => {
  const downloadSupplementaryFile = async (req: Request, res: Response, next: NextFunction) => {
    const {
      identifier,
      fileId,
    } = req.params;

    // Check for valid preprint
    const article = await repo.findArticleVersion(identifier, true);
    if (!article) {
      res.status(400);
      return;
    }

    // construct filePath
    try {
      const s3Client = getS3Client(config.eppS3);
      const s3File = constructEPPVersionS3FilePath(fileId, article.article.msid, article.article.versionIdentifier);
      const redirectUrl = await getPresignedDownloadUrl(s3Client, s3File);

      res.redirect(redirectUrl);
    } catch (err) {
      next(err);
    }
  };

  return {
    downloadSupplementaryFile,
  };
};
