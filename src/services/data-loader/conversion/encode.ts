import { convert } from '@stencila/encoda';

export type PreprintXmlFile = string;

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