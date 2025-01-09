import { NextFunction, Request, Response } from 'express';
import { constructEPPS3File, getPresignedDownloadUrl, getPresignS3Client } from '../utils/s3';
import { config } from '../config';

export const filesController = () => {
  const downloadSupplementaryFile = async (req: Request, res: Response, next: NextFunction) => {
    const { fileId } = req.params;

    // construct a presigned URL for the requested file
    try {
      const s3Client = getPresignS3Client(config.eppS3);
      const s3File = constructEPPS3File(fileId);
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
