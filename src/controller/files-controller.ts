import { type NextFunction, type Request, type Response } from 'express';
import { constructEPPS3File, getPresignedDownloadUrl, getPresignS3Client } from '../utils/s3';
import { config } from '../config';

export const filesController = () => {
  const downloadSupplementaryFile = async (req: Request, res: Response, next: NextFunction) => {
    // A wildcard route will separate te result into an array of segments. This puts them back together
    const fileId = Array.isArray(req.params.fileId) ? req.params.fileId.join('/') : req.params.fileId;

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
