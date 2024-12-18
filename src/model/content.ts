type DecoratedContent = {
  content: Content,
};

type ParagraphContent = DecoratedContent & {
  type: 'Paragraph',
};

type StrongContent = DecoratedContent & {
  type: 'Strong',
};

type NontextualAnnotationContent = DecoratedContent & {
  type: 'NontextualAnnotation',
};

type DateContent = DecoratedContent & {
  type: 'Date',
};

type LinkContent = DecoratedContent & {
  type: 'Link',
  target: string,
  relation?: string,
};

type CiteContent = DecoratedContent & {
  type: 'Cite',
  target: string,
};

type CiteGroupContent = {
  type: 'CiteGroup',
  items: CiteContent[],
};

type HeadingContent = DecoratedContent & {
  type: 'Heading',
  id?: string,
  depth: 1 | 2 | 3 | 4 | 5 | 6,
};

type FigureContent = DecoratedContent & {
  type: 'Figure',
  id?: string,
  caption?: Content,
  label?: string,
};

type ImageObjectContent = {
  type: 'ImageObject',
  id?: string,
  contentUrl?: string,
  content?: Content
  meta: {
    inline: boolean,
  },
};

type EmphasisContent = DecoratedContent & {
  type: 'Emphasis',
};

type SuperscriptContent = DecoratedContent & {
  type: 'Superscript',
};

type SubscriptContent = DecoratedContent & {
  type: 'Subscript',
};

type ListItemContent = DecoratedContent & {
  type: 'ListItem',
};

export const listType = ['order', 'bullet', 'alpha-lower', 'alpha-upper', 'roman-lower', 'roman-upper', 'simple', 'custom'] as const;
type ListContent = {
  type: 'List',
  order: 'Unordered' | 'Ascending',
  items: Array<ListItemContent>,
  meta?: {
    listType: typeof listType[number],
  }
};

type ClaimContent = DecoratedContent & {
  type: 'Claim',
  claimType?: 'Statement' | 'Theorem' | 'Lemma' | 'Proof' | 'Postulate' | 'Hypothesis' | 'Proposition' | 'Corollary',
  label?: Content,
  title?: Content,
};

type OtherContent = {
  type: 'CodeBlock' | 'MathFragment' | 'MediaObject' | 'QuoteBlock' | 'Table' | 'ThematicBreak' | 'Note'
};

type ContentPart =
  string |
  HeadingContent |
  EmphasisContent |
  SuperscriptContent |
  SubscriptContent |
  ParagraphContent |
  StrongContent |
  NontextualAnnotationContent |
  DateContent |
  LinkContent |
  CiteContent |
  CiteGroupContent |
  FigureContent |
  ImageObjectContent |
  ListItemContent |
  ListContent |
  ClaimContent |
  OtherContent;

export type Content = ContentPart | Array<Content>;
