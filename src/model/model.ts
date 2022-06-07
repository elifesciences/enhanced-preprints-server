import { createInMemoryArticleRepository } from "./in-memory/in-memory-repository";
import { createSqliteArticleRepository } from "./sqlite/sqlite-repository";

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
}

export type ProcessedArticle = ArticleContent & {
  title: ArticleTitle,
  date: Date,
};

export type ArticleSummary = {
  doi: Doi
  title: ArticleTitle,
  date: Date,
}

export type ReviewText = string;
export enum ReviewType {
  EvaluationSummary = "evaluation_summary",
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
  storeArticle(article: ArticleContent): Promise<boolean>;
  getArticle(doi: Doi): Promise<ProcessedArticle>;
  getArticleSummaries(): Promise<ArticleSummary[]>;
}

export enum StoreType {
  InMemory = "InMemory",
  Sqlite = "Sqlite"
}

export const createArticleRepository = async (kind: StoreType, connectionString = ''): Promise<ArticleRepository> => {
  if (kind == StoreType.Sqlite) {
    return createSqliteArticleRepository(connectionString);
  }

  //default to InMemory
  return createInMemoryArticleRepository();
}

//type related to the JSON output of encoda
export type ArticleStruct = {
  id: string,
  journal: string,
  title: string,
  datePublished: DateType
  dateAccepted: DateType
  dateReceived: DateType
  identifiers: Array<ArticleIdentifier>
}
type ArticleIdentifier = {
  name: string,
  value: string
}

type DateType = {
  type: string,
  value: string
}
