import { NextFunction, Request, Response } from 'express';

export const downloadsController = () => {
  const downloadPdf = async (req: Request, res: Response, next: NextFunction) => {
    const {
      msid,
      versionIdentifier
    } = req.params;
    
    try {
      const redirectUrl = `https://github.com/elifesciences/enhanced-preprints-data/raw/master/data/${msid}/v${versionIdentifier}/${msid}-v${versionIdentifier}.pdf`;

      res.redirect(redirectUrl);
    } catch (err) {
      next(err);
    }
  };
  return {
    downloadPdf,
  };
};
