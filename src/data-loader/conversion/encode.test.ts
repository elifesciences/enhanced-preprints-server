import * as encoda from '@stencila/encoda';
import { JSDOM } from 'jsdom';
import { convertJatsToHtml } from './encode';

describe('encode', () => {
  describe('JATS XML to HTML', () => {
    it('converts provided JATS XML to HTML', async () => {
      const convertMock = jest.spyOn(encoda, 'convert');
      convertMock.mockImplementation(() => Promise.resolve('<html lang="en">article</html>'));
      const html = await convertJatsToHtml('data/journalId/articleId/articleId.xml');

      expect(html).not.toBeNull();
      expect(convertMock).toHaveBeenCalledTimes(1);
      expect(convertMock).toHaveBeenCalledWith('data/journalId/articleId/articleId.xml', undefined, {
        from: 'jats',
        to: 'html',
        encodeOptions: {
          isStandalone: false,
          isBundle: false,
        },
      });
      jest.restoreAllMocks();
    });

    it('converts JATS to HTML that contains an Abstract heading', async () => {
      const html = await convertJatsToHtml('test-utils/jats-examples/example.xml');
      const articleDom = JSDOM.fragment(html);
      const abstractHeading = articleDom.querySelector('article > [data-itemprop="description"] > h2[data-itemtype="https://schema.stenci.la/Heading"]');
      expect(abstractHeading).not.toBeNull();
      expect(abstractHeading?.textContent).toBe('Abstract');
    });

    it('converts JATS to HTML with article body after the identifiers HTML', async () => {
      const html = await convertJatsToHtml('test-utils/jats-examples/example.xml');
      const articleDom = JSDOM.fragment(html);
      const articleText = Array.from(articleDom.querySelectorAll('[data-prop="identifiers"] ~ *'))
        .map((element) => element?.textContent ?? '')
        .filter((line) => line.trim());

      expect(articleText).toContain('Introduction');
      expect(articleText).toContain('This is a simple article body');
    });

    it('converts JATS to HTML and expects headers to have a itemtype attribute', async () => {
      const html = await convertJatsToHtml('test-utils/jats-examples/example.xml');
      const articleDom = JSDOM.fragment(html);
      const articleText = articleDom.querySelector('[itemtype="https://schema.stenci.la/Heading"]');

      expect(articleText?.textContent).toBe('Introduction');
    });
  });
});
