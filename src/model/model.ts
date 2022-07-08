import { Content } from './content';

export type Doi = string;

export type ArticleXML = string;
export type ArticleDocument = string;
export type ArticleHTML = string;
export type ArticleContent = {
  doi: Doi
  xml: ArticleXML,
  document: ArticleDocument,
  html: ArticleHTML,
};

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
