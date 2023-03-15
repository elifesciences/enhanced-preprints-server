import * as encoda from '@stencila/encoda';
import { ArticleStruct } from '../data-loader';
import { convertJatsToJson } from './encode';

describe('encode', () => {
  describe('JATS XML to JSON', () => {
    it('converts provided JATS XML to JSON', async () => {
      const convertMock = jest.spyOn(encoda, 'convert');
      convertMock.mockImplementation(() => Promise.resolve('<html lang="en">article</html>'));
      const json = await convertJatsToJson('data/journalId/articleId/articleId.xml');
      expect(json).not.toBeNull();
      expect(convertMock).toHaveBeenCalledTimes(1);
      expect(convertMock).toHaveBeenCalledWith('data/journalId/articleId/articleId.xml', undefined, {
        from: 'jats',
        to: 'json',
        encodeOptions: {
          isBundle: false,
        },
      });
      jest.restoreAllMocks();
    });

    it('converts JATS to HTML that contains an Abstract heading', async () => {
      const articleStruct = JSON.parse(await convertJatsToJson('test-utils/jats-examples/example.xml')) as ArticleStruct;

      expect(articleStruct.description).not.toBeNull();
      expect(articleStruct.description).toStrictEqual([{ content: ['This is an abstract'], type: 'Paragraph' }]);
    });
  });
});
