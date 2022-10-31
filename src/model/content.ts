/*
 * The Encoda JSON process converts various JATS input into structures that are either a string, a structure with a type
 * and content or an array that contains any of the above.
 * I guess in theory this can be infinitely deep, so recursively converting this to text to use it more
 * easily.
 *
 * examples:
 * - "a string"
 * - ["a", "string"]
 * - {"type":"emphasis", "content":"a"}
 * - {"type":"emphasis", "content":["a"]}
 * - [{"type":"emphasis", "content":["a"]}, "string"]
 *
 * See tests for more examples
 */

type DecoratedContent = {
  content: string | DecoratedContent | Array<DecoratedContent | string>,
  type: string,
};

export type HeadingContent = DecoratedContent & {
  type: 'Heading',
  id: string,
  depth: number,
};

export type EmphasisContent = DecoratedContent & {
  type: 'Emphasis',
  depth: number,
};

export type SuperscriptContent = DecoratedContent & {
  type: 'Superscript',
};

export type SubscriptContent = DecoratedContent & {
  type: 'Subscript',
};

type ContentPart = string | DecoratedContent | HeadingContent | EmphasisContent;
export type Content = string | ContentPart | Array<ContentPart>;
