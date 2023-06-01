import {
  Heading as HeadingContent,
  Node,
} from '@stencila/schema';

export type Content = Array<Node> | Node;

export type Heading = {
  id: string,
  text: Content,
};

const isHeadingContent = (content: Content): content is HeadingContent => !Array.isArray(content) && typeof content === 'object' && content?.type === 'Heading';

const extractHeadingContentPart = (contentPart: Content): HeadingContent[] => {
  if (isHeadingContent(contentPart)) {
    return [contentPart];
  }

  if (Array.isArray(contentPart)) {
    return contentPart.flatMap(extractHeadingContentPart);
  }

  return [];
};

export const extractHeadings = (content: Content): Heading[] => {
  const headingContentParts = extractHeadingContentPart(content);

  return headingContentParts.map((heading, index) => ({
    id: (!heading.id || heading.id === '') ? `gen_header_${index}` : heading.id,
    text: heading.content,
  }));
};
