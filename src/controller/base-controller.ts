import { NextFunction, Request, Response } from 'express';

export const baseController = () => {
  const getBase = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.redirect('/api/reviewed-preprints/');
    } catch (err) {
      next(err);
    }
  };

  return { getBase };
};
