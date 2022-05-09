import { createInMemoryArticleStore } from "./in-memory/article-store";
import { createInMemoryReviewingGroupStore } from "./in-memory/reviewing-group-store";


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

// The states of the article
export type ProcessedArticle = {
  doi: Doi
  title: ArticleTitle,
  date: Date,
  xml: ArticleXML,
  html: ArticleHTML,
  json: ArticleJSON,
};
export type ReviewingArticle = ProcessedArticle & {
  reviewingGroupId: ReviewingGroupId
}

export type ReviewText = string;
export enum ReviewType {
  EvaluationSummary = "evaluation_summary",
  AuthorResponse = "author_response",
}
export type Review = {
  date: Date,
  reviewType: ReviewType,
  review: ReviewText,
}
export type ReviewedArticle = ReviewingArticle & {
  review: Review,
}

export type EnhancedArticle = (ReviewingArticle | ReviewedArticle) & {
  previousVersions: EnhancedArticle[]
};

export interface ArticleStore {
  storeArticle(article: ProcessedArticle, reviewingGroupId: ReviewingGroupId): boolean;
  getArticle(doi: Doi): EnhancedArticle;
  addReview(doi: Doi, review: Review): boolean;
  getArticlesForReviewingGroup(reviewingGroup: ReviewingGroupId): EnhancedArticle[];
}

export interface ReviewingGroupStore {
  addReviewingGroup(reviewingGroup: ReviewingGroup): boolean;
  getReviewingGroup(reviewingGroupId: ReviewingGroupId): ReviewingGroup;
  getReviewingGroups(): ReviewingGroup[];
}

export enum StoreType {
  InMemory
}

export const createArticleStore = (kind: StoreType): ArticleStore => {
  if (kind == StoreType.InMemory) {
    return createInMemoryArticleStore();
  }

  //default to InMemory
  return createInMemoryArticleStore();
}

export const createReviewingGroupStore = (kind: StoreType): ReviewingGroupStore => {
  if (kind == StoreType.InMemory) {
    return createInMemoryReviewingGroupStore();
  }

  //default to InMemory
  return createInMemoryReviewingGroupStore();
}
