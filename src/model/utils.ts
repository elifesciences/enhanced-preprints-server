import { MarkdownText } from './model';

/*
 * The Encoda JSON process converts various JATS input into structures that are either a string, or an array
 * that contains elements that are either a string, or an object that "decorates" another content array.
 * I guess in theory this can be infinitely deep, so recursively converting this to text to use it more
 * easily.
 */
export const normaliseContentToMarkdown = (content: Content): MarkdownText => {
  if (typeof content === 'string') {
    try {
      return normaliseContentToMarkdown(JSON.parse(content));
    } catch (error) {
      // just an ordinary string
      return content;
    }
  }

  const contentParts = content.map((contentPart) => {
    if (typeof contentPart === 'string') {
      return contentPart;
    }

    if (contentPart?.type === 'Emphasis') {
      return `**${normaliseContentToMarkdown(contentPart.content)}**`;
    }

    return normaliseContentToMarkdown(contentPart?.content);
  });

  return contentParts.join('');
};

type DecoratedContent = {
  content: string | string[],
  type: string,
};

type ContentPart = string | DecoratedContent;
export type Content = string | ContentPart[];
