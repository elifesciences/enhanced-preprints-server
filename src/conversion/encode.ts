import { convert } from "@stencila/encoda";

export const convertToHtml = (journalId: string, articleId: string, jsonReq: boolean): Promise<string | undefined> => {
  return convert(`data/${journalId}/${articleId}/${articleId}.xml`, undefined, {
    from: 'jats',
    to: jsonReq ? 'json' : 'html',
    encodeOptions: {
      theme: 'elife',
      isStandalone: true,
      isBundle: true,
    }
  });
};
