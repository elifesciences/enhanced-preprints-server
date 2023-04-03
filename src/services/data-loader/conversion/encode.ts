import { convert } from '@stencila/encoda';
import { convert as convertNext } from '@stencila/encoda-next';
import { config } from '../../../config';

export type PreprintXmlFile = string;

export const convertJatsToJson = async (file: PreprintXmlFile): Promise<string> => {
  const converter = config.encodaNext ? convertNext : convert;
  const converted = await converter(
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
