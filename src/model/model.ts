import { Content } from './content';

export type Doi = string;

export type ArticleDocument = string;
export type ArticleHTML = string;
export type ArticleContent = {
  doi: Doi
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
  affiliations?: Organisation[],
};

export type License = {
  type: string,
  url: string,
};

export type Heading = {
  id: string,
  text: Content,
};
export type PublicationType = 'PublicationVolume' | 'Periodical';
export type Publication = {
  type: PublicationType,
  name: string,
  volumeNumber?: number,
  isPartOf?: Publication,
};
export type Reference = {
  type: 'Article',
  id: string,
  title: string,
  url: string,
  pageEnd: number,
  pageStart: number,
  authors: Array<Author>,
  datePublished: {
    type: string,
    value: string
  },
  isPartOf?: Publication,
};

export type ProcessedArticle = Omit<ArticleContent, 'document'> & {
  title: ArticleTitle,
  date: Date,
  authors: Author[],
  abstract: ArticleAbstract,
  licenses: License[],
  content: Content,
  headings: Heading[],
  references: Reference[],
};

export type ArticleSummary = {
  doi: Doi
  title: ArticleTitle,
  date: Date,
};

export type ReviewText = string;
export enum ReviewType {
  EvaluationSummary = 'evaluation-summary',
  Review = 'review-article',
  AuthorResponse = 'reply',
}

export type Participant = {
  name: string,
  role: string,
};

export type Evaluation = {
  date: Date,
  reviewType: ReviewType,
  text: ReviewText,
  participants: Participant[],
};

export type PeerReview = {
  evaluationSummary: Evaluation,
  reviews: Evaluation[],
  authorResponse?: Evaluation,
};

export type EnhancedArticle = ProcessedArticle & {
  peerReview: PeerReview,
};

export interface ArticleRepository {
  storeArticle(article: ProcessedArticle): Promise<boolean>;
  getArticle(doi: Doi): Promise<ProcessedArticle>;
  getArticleSummaries(): Promise<ArticleSummary[]>;
}
