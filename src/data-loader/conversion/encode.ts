import { convert } from "@stencila/encoda";

export type PreprintXmlFile = string;

export const convertJatsToHtml = async (file: PreprintXmlFile): Promise<string> => {
  const converted = await convert(file, undefined, { // undefined output here is required to return html, causes console output
    from: 'jats',
    to: 'html',
    encodeOptions: {
      isStandalone: false,
      isBundle: true,
    }
  });

  return converted || '';
};

export const convertJatsToJson = async (file: PreprintXmlFile): Promise<string> => {
  const converted = await convert(file, undefined, { // undefined output here is required to return html, causes console output
    from: 'jats',
    to: 'json',
    encodeOptions: {
      isBundle: true,
    }
  });

  return converted || '';
};
