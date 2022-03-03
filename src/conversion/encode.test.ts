import { convertJatsToHtml } from "./encode";

describe('encode', () => {
  describe('JATS XML to HTML', () => {
    it('converts provided JATS XML to HTML', async () => {
      const html = await convertJatsToHtml('10.1101', '2021.07.05.451181');
      expect(html).not.toBeNull();
      expect(html.startsWith('<article')).toBeTruthy();
      expect(html.endsWith('</article>')).toBeTruthy();
    });
  });
});
