import { convert } from '@stencila/encoda';

export const convertJatsToHtml = async (journalId: string, articleId: string): Promise<string> => {
  const converted = await convert(`data/${journalId}/${articleId}/${articleId}.xml`, undefined, { // undefined output here is required to return html, causes console output
    from: 'jats',
    to: 'html',
    encodeOptions: {
      theme: 'elife',
      isStandalone: false,
      isBundle: true,
    },
  });

  return converted || '';
};
