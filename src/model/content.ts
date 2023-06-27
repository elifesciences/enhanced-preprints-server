type DecoratedContent = {
  content: Content,
};

type ParagraphContent = DecoratedContent & {
  type: 'Paragraph',
};

type StrongContent = DecoratedContent & {
  type: 'Strong',
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
  id: string,
  caption: Content,
  label: string,
};

type ImageObjectContent = {
  type: 'ImageObject',
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

type ListContent = {
  type: 'List',
  order: 'Unordered' | 'Ascending',
  items: Array<ListItemContent>,
};

type ClaimContent = DecoratedContent & {
  type: 'Claim',
  claimType: 'Statement' | 'Theorem' | 'Lemma' | 'Proof' | 'Postulate' | 'Hypothesis' | 'Proposition' | 'Corollary',
  label?: Content,
  title?: Content,
};

type OtherContent = {
  type: 'CodeBlock' | 'MathFragment' | 'MediaObject' | 'Table' | 'ThematicBreak'
};

type ContentPart =
  string |
  HeadingContent |
  EmphasisContent |
  SuperscriptContent |
  SubscriptContent |
  ParagraphContent |
  StrongContent |
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
