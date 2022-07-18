export type Doi = string;
export type ArticleXML = string;
export type ArticleTitle = string;
export type ArticleHTML = string;
export type ArticleJSON = string;

export type ArticleContent = {
  doi: Doi
  xml: ArticleXML,
  html: ArticleHTML,
  json: ArticleJSON,
};

export type ProcessedArticle = ArticleContent & {
  title: ArticleTitle,
  date: Date,
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
  peerReview: PeerReview | string,
};

export interface ArticleRepository {
  storeArticle(article: ArticleContent): Promise<boolean>;
  getArticle(doi: Doi): Promise<ProcessedArticle>;
  getArticleSummaries(): Promise<ArticleSummary[]>;
}
