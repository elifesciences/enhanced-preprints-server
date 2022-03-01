import { convertToHtml } from "./encode";

describe('encode', () => {
  describe('JATS XML to HTML', () => {
    it('converts provided JATS XML to HTML', async () => {
      const html = await convertToHtml('10.1101', '2021.07.05.451181', false);
      expect(html).not.toBeNull();
      expect(html.startsWith('<html')).toBeTruthy();
      expect(html.endsWith('</html>')).toBeTruthy();
    });
  });

  describe('JATS XML to JSON', () => {
    it('converts provided JATS XML to HTML', async () => {
      const json = await convertToHtml('10.1101', '2021.07.05.451181', true);
      expect(json).not.toBeNull();
      expect(JSON.parse(json)['type']).toBe('Article');
    });
  });
});
