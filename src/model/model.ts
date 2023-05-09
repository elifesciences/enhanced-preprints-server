import { Content } from './content';

export type Doi = string;

export type ArticleDocument = string;
export type ArticleContent = {
  doi: Doi
  document: ArticleDocument,
};

export type ArticleTitle = Content;
export type ArticleAbstract = Content;
export type Address = {
  addressCountry?: string,
};
export type Organisation = {
  name: string,
  address?: Address,
};

export type OrcidIdentifier = {
  type: 'orcid',
  value: string,
};

export type Identifier = OrcidIdentifier;

export type Author = {
  familyNames: string[],
  givenNames?: string[],
  affiliations?: Organisation[],
  emails?: string[],
  identifiers?: Identifier[],
};

export type License = {
  type: string,
  url: string,
};

export type Heading = {
  id?: string,
  text: Content,
};
export type PublicationType = 'CreativeWork' | 'Periodical' | 'PublicationIssue' | 'PublicationVolume';
export type Publication = {
  type: PublicationType,
  name?: string,
  volumeNumber?: number,
  isPartOf?: Publication,
};
export type Reference = {
  type: 'Article',
  id: string,
  title: string,
  url?: string,
  pageEnd?: number,
  pageStart?: number,
  authors: Array<Author | Organisation>,
  datePublished?: Date,
  isPartOf?: Publication,
  identifiers?: {
    type: string,
    name: string,
    propertyID?: string,
    value: string,
  }[],
  meta?: {
    label?: string,
  },
};

export type ProcessedArticle = {
  doi: string,
  hash?: string,
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
  id: string,
  doi: Doi
  title: ArticleTitle,
  date: Date,
};

export type ArticleHash = {
  id: string,
  hash?: string,
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
  institution: string,
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

export type EnhancedArticle = {
  id: string,
  hash?: string,
  msid: string,
  doi: string,
  versionIdentifier: string,
  versionDoi?: string,
  // When we drop the old article schema from the DB,
  // we can change ProcessedArticle to exclude these properties and drop `Omit` here
  article: Omit<ProcessedArticle, 'doi' | 'date'>,
  preprintDoi: string,
  preprintUrl: string,
  preprintPosted: Date,
  sentForReview?: Date,
  peerReview?: PeerReview,
  published?: Date,
};

export type EnhancedArticleWithVersions = {
  article: EnhancedArticle,
  versions: Record<string, EnhancedArticle>,
};

export interface ArticleRepository {
  storeArticle(article: ProcessedArticle, id: string): Promise<boolean>;
  getArticle(id: string): Promise<ProcessedArticle>;
  getArticleSummaries(): Promise<ArticleSummary[]>;
  getArticleHashes(): Promise<ArticleHash[]>;
  storeEnhancedArticle(article: EnhancedArticle): Promise<boolean>;
  getArticleVersion(identifier: string): Promise<EnhancedArticleWithVersions>;
}
