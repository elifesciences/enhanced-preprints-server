import * as encoda from '@stencila/encoda';
import { JSDOM } from 'jsdom';
import { convertJatsToHtml } from './encode';

describe('encode', () => {
  describe('JATS XML to HTML', () => {
    it('converts provided JATS XML to HTML', async () => {
      const convertMock = jest.spyOn(encoda, 'convert');
      convertMock.mockImplementation(() => Promise.resolve('<html lang="en">article</html>'));
      const html = await convertJatsToHtml('data/journalId/articleId/articleId.xml', false);

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

    it('allows the option to bundle resources', async () => {
      const convertMock = jest.spyOn(encoda, 'convert');
      convertMock.mockImplementation(() => Promise.resolve('<html lang="en">article</html>'));
      const html = await convertJatsToHtml('data/journalId/articleId/articleId.xml', true);

      expect(html).not.toBeNull();
      expect(convertMock).toHaveBeenCalledTimes(1);
      expect(convertMock).toHaveBeenCalledWith('data/journalId/articleId/articleId.xml', undefined, {
        from: 'jats',
        to: 'html',
        encodeOptions: {
          isStandalone: false,
          isBundle: true,
        },
      });
      jest.restoreAllMocks();
    });

    it('converts JATS to HTML that contains an Abstract heading', async () => {
      const html = await convertJatsToHtml('test-utils/jats-examples/example.xml', true);
      const articleDom = JSDOM.fragment(html);
      const abstractHeading = articleDom.querySelector('article > [data-itemprop="description"] > h2[data-itemtype="https://schema.stenci.la/Heading"]');
      expect(abstractHeading).not.toBeNull();
      expect(abstractHeading?.textContent).toBe('Abstract');
    });

    it('converts JATS to HTML with article body after the identifiers HTML', async () => {
      const html = await convertJatsToHtml('test-utils/jats-examples/example.xml', true);
      const articleDom = JSDOM.fragment(html);
      const articleText = Array.from(articleDom.querySelectorAll('[data-prop="identifiers"] ~ *'))
        .map((element) => element?.textContent ?? '')
        .filter((line) => line.trim());

      expect(articleText).toContain('Introduction');
      expect(articleText).toContain('This is a simple article body');
    });

    it('converts JATS to HTML and expects headers to have a itemtype attribute', async () => {
      const html = await convertJatsToHtml('test-utils/jats-examples/example.xml', true);
      const articleDom = JSDOM.fragment(html);
      const articleText = articleDom.querySelector('[itemtype="https://schema.stenci.la/Heading"]');

      expect(articleText?.textContent).toBe('Introduction');
    });

    it('converts JATS to HTML and optionally bundles resources', async () => {
      const html = await convertJatsToHtml('test-utils/jats-examples/example.xml', true);
      const articleDom = JSDOM.fragment(html);
      const figureLabel = articleDom.querySelector('#fig1 > label');
      const figureCaption = articleDom.querySelector('#fig1 > figcaption');
      const figureImg = articleDom.querySelector('#fig1 > img');

      expect(figureLabel?.textContent?.trim()).toBe('Figure 1.');
      expect(figureCaption?.textContent?.trim()).toBe('This is an image');
      expect(figureImg?.getAttribute('src')?.startsWith('data:image/png;base64,')).toBe(true);
      expect(figureImg?.getAttribute('src')?.length).toBeGreaterThan(22);

      const html2 = await convertJatsToHtml('test-utils/jats-examples/example.xml', false);
      const articleDom2 = JSDOM.fragment(html2);
      const figureImg2 = articleDom2.querySelector('#fig1 > img');
      expect(figureImg2?.getAttribute('src')?.startsWith('/')).toBe(true);
    });
  });
});
