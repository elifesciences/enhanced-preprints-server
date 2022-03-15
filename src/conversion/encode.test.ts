import { convertJatsToHtml } from "./encode";
import * as encoda from "@stencila/encoda";

describe('encode', () => {
  describe('JATS XML to HTML', () => {
    it('converts provided JATS XML to HTML', async () => {
      const convertMock = jest.spyOn(encoda, 'convert');
      convertMock.mockImplementation(() => Promise.resolve(`<html lang="en">article</html>`));
      const html = await convertJatsToHtml('journalId', 'articleId');
      expect(html).not.toBeNull();
      expect(convertMock).toHaveBeenCalledTimes(1);
      expect(convertMock).toHaveBeenCalledWith('data/journalId/articleId/articleId.xml', undefined, {
        from: 'jats',
        to: 'html',
        encodeOptions: {
          theme: 'elife',
          isStandalone: false,
          isBundle: true,
        }
      });
    });
  });
});
