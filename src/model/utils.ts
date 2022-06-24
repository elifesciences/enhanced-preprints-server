import { MarkdownText } from './model';

/*
 * The Encoda JSON process converts various JATS input into structures that are either a string, or an array
 * that contains elements that are either a string, or an object that "decorates" another content array.
 * I guess in theory this can be infinitely deep, so recursively converting this to text to use it more
 * easily.
 */
export const normaliseContentToText = (content: Content): string => {
  if (typeof content === 'string') {
    try {
      return normaliseContentToText(JSON.parse(content));
    } catch (error) {
      // just an ordinary string
      return content;
    }
  }

  const contentParts = content.map((contentPart) => {
    if (typeof contentPart === 'string') {
      return contentPart;
    }
    return normaliseContentToText(contentPart?.content);
  });

  return contentParts.join('');
};

// TODO: markdown it up baby
export const normaliseContentToMarkdown = (content: Content): MarkdownText => normaliseContentToText(content) as MarkdownText;

type DecoratedContent = {
  content: string | string[],
  type: string,
};

type ContentPart = string | DecoratedContent;
export type Content = string | ContentPart[];
