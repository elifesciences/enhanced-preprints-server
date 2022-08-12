import { convert } from '@stencila/encoda';

export type PreprintXmlFile = string;

export const convertJatsToHtml = async (file: PreprintXmlFile, bundleResources: boolean): Promise<string> => {
  const converted = await convert(
    file,
    undefined, // require undefined to return html, causes console output
    {
      from: 'jats',
      to: 'html',
      encodeOptions: {
        isStandalone: false,
        isBundle: bundleResources,
      },
    },
  );

  return converted || '';
};

export const convertJatsToJson = async (file: PreprintXmlFile): Promise<string> => {
  const converted = await convert(
    file,
    undefined, // require undefined to return html, causes console output
    {
      from: 'jats',
      to: 'json',
      encodeOptions: {
        isBundle: false,
      },
    },
  );

  return converted || '';
};
