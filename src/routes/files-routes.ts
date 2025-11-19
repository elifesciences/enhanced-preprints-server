import { type Response, type Request, Router } from 'express';
import { filesController } from '../controller/files-controller';

export const filesRoutes = () => {
  const router = Router();
  router.get('/api/files/ping', async (req: Request, res: Response) => {
    // Set the Content-Type header for SVG
    res.setHeader('Content-Type', 'image/svg+xml');

    // SVG content with the word "pong"
    const svgContent = `
      <svg width="100" height="50" xmlns="http://www.w3.org/2000/svg">
        <text x="10" y="30" font-family="Arial" font-size="24" fill="black">pong</text>
      </svg>
    `;

    // Send the SVG content
    res.status(200).send(svgContent);
  });

  router.get('/api/files/*fileId', filesController().downloadSupplementaryFile);

  return router;
};
