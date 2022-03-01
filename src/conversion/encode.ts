import { convert } from "@stencila/encoda";

export const convertToHtml = async (journalId: string, articleId: string, toJson: boolean = false): Promise<string> => {
  const converted = await convert(`data/${journalId}/${articleId}/${articleId}.xml`, undefined, { // undefined output here is required to return html, causes console output
    from: 'jats',
    to: toJson ? 'json' : 'html',
    encodeOptions: {
      theme: 'elife',
      isStandalone: true,
      isBundle: true,
    }
  });

  return converted || '';
};
