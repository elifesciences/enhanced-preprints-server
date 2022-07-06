import {
  ArticleRepository,
  Doi,
  EnhancedArticle,
  Review,
  ReviewType,
} from '../model/model';
import { fetchReviews } from './fetch-reviews';

export type GetEnhancedArticle = (doi: Doi) => Promise<EnhancedArticle>;

const getEnhancedArticleWithDependencies = async (doi: Doi, articleRepository: ArticleRepository, reviewingGroupId: string): Promise<EnhancedArticle> => {
  const article = await articleRepository.getArticle(doi);
  const reviewTexts = await fetchReviews(doi, reviewingGroupId);

  const reviews = reviewTexts.map((reviewText: string): Review => ({
    date: new Date(),
    reviewType: ReviewType.EvaluationSummary,
    text: reviewText,
    reviewOf: article,
  }));

  return {
    doi: article.doi,
    title: article.title,
    date: article.date,
    authors: article.authors,
    abstract: article.abstract,
    licenses: article.licenses,
    content: article.content,
    headings: article.headings,
    reviews,
  };
};

export const createEnhancedArticleGetter = (articleRepository: ArticleRepository, reviewingGroupId: string): GetEnhancedArticle => async (doi: Doi) => getEnhancedArticleWithDependencies(doi, articleRepository, reviewingGroupId);
