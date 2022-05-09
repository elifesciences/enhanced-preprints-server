import { createInMemoryArticleRepository } from "./in-memory/article-repository";


export type ReviewingGroupId = string;
export type ReviewingGroupName = string;
export type ReviewingGroup = {
  id: ReviewingGroupId,
  name: ReviewingGroupName,
};





export type Doi = string;
export type ArticleXML = string;
export type ArticleTitle = string;
export type ArticleHTML = string;
export type ArticleJSON = string;
export type ProcessedArticle = {
  doi: Doi
  title: ArticleTitle,
  date: Date,
  xml: ArticleXML,
  html: ArticleHTML,
  json: ArticleJSON,
};

export type ArticleSummary = {
  doi: Doi
  title: ArticleTitle,
  date: Date,
}

export type ReviewText = string;
export enum ReviewType {
  EvaluationSummary = "evaluation_summary",
  AuthorResponse = "author_response",
}
export type Review = {
  date: Date,
  reviewType: ReviewType,
  text: ReviewText,
  reviewOf: ProcessedArticle
}

export type EnhancedArticle = ProcessedArticle & {
  reviews: Review[]
};


export interface ArticleRepository {
  storeArticle(article: ProcessedArticle): Promise<boolean>;
  getArticle(doi: Doi): Promise<ProcessedArticle>;
  getArticleSummaries(): Promise<ArticleSummary[]>;
}

export enum StoreType {
  InMemory
}

export const createArticleRepository = async (kind: StoreType): Promise<ArticleRepository> => {
  if (kind == StoreType.InMemory) {
    return createInMemoryArticleRepository();
  }

  //default to InMemory
  return createInMemoryArticleRepository();
}
