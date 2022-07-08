import { Content } from './model';

/*
 * The Encoda JSON process converts various JATS input into structures that are either a string, or an array
 * that contains elements that are either a string, or an object that "decorates" another content array.
 * I guess in theory this can be infinitely deep, so recursively converting this to text to use it more
 * easily.
 */
export const normaliseContentToHtml = (content: Content): string => {
  if (typeof content === 'string') {
    try {
      return normaliseContentToHtml(JSON.parse(content));
    } catch (error) {
      // just an ordinary string
      return content;
    }
  }

  const contentParts = content.map((contentPart) => {
    if (typeof contentPart === 'string') {
      return contentPart;
    }

    switch (contentPart?.type) {
      case 'Emphasis':
        return `<em>${normaliseContentToHtml(contentPart.content)}</em>`;
      case 'Strong':
        return `<strong>${normaliseContentToHtml(contentPart.content)}</strong>`;
      case 'Article':
      case 'Include':
      case 'Heading':
      case 'Paragraph':
      case 'QuoteBlock':
      case 'Cite':
      case 'CiteGroup':
      case 'CodeBlock':
      case 'CodeChunk':
      case 'CodeExpression':
      case 'CodeFragment':
      case 'Person':
      case 'CreativeWork':
      case 'Periodical':
      case 'PublicationIssue':
      case 'PublicationVolume':
      case 'SoftwareSourceCode':
      case 'MediaObject':
      case 'Collection':
      case 'Figure':
      case 'List':
      case 'ListItem':
      case 'Table':
      case 'TableRow':
      case 'TableCell':
      case 'Datatable':
      case 'Date':
      case 'ThematicBreak':
      case 'Organization':
      case 'Mark':
      case 'Delete':
      case 'Superscript':
      case 'Subscript':
      case 'Link':
      case 'Quote':
      case 'MathBlock':
      case 'MathFragment':
      case 'AudioObject':
      case 'ImageObject':
      case 'VideoObject':
      default:
        console.log(`Unimplemented code block: ${contentPart?.type}`);
        return normaliseContentToHtml(contentPart?.content);
    }
  });

  return contentParts.join('');
};
