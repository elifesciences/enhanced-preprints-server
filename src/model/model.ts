export type Doi = string;

export type ArticleXML = string;
export type ArticleHTML = string;
export type ArticleJSON = string;
export type ArticleContent = {
  doi: Doi
  xml: ArticleXML,
  html: ArticleHTML,
  json: ArticleJSON,
};

// encoda's output requires this very strange combination of content, where it can be "a string", ["a", "string"], or
// [{"type":"emphasis", "content":["a"]}, "string"] - and all combinations of the above
type DecoratedContent = {
  content: string | string[],
  type: string,
};
type ContentPart = string | DecoratedContent;
export type Content = string | ContentPart[];

export type ArticleTitle = Content;
export type ArticleAbstract = Content;
export type Address = {
  addressCountry: string,
};
export type Organisation = {
  name: string,
  address?: Address,
};

export type Author = {
  familyNames: string[],
  givenNames: string[],
  affiliations: Organisation[],
};

export type License = {
  type: string,
  url: string,
};

export type Heading = {
  id: string,
  text: Content,
};

export type ProcessedArticle = ArticleContent & {
  title: ArticleTitle,
  date: Date,
  authors: Author[],
  abstract: ArticleAbstract,
  licenses: License[],
  content: Content,
  headings: Heading[],
};

export type ArticleSummary = {
  doi: Doi
  title: ArticleTitle,
  date: Date,
};

export type ReviewText = string;
export enum ReviewType {
  EvaluationSummary = 'evaluation_summary',
}
export type Review = {
  date: Date,
  reviewType: ReviewType,
  text: ReviewText,
  reviewOf: ProcessedArticle
};

export type EnhancedArticle = ProcessedArticle & {
  reviews: Review[]
};

export interface ArticleRepository {
  storeArticle(article: ArticleContent): Promise<boolean>;
  getArticle(doi: Doi): Promise<ProcessedArticle>;
  getArticleSummaries(): Promise<ArticleSummary[]>;
}
