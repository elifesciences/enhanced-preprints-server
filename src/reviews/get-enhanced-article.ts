import {
  ArticleRepository,
  Doi,
  EnhancedArticle,
} from '../model/model';
import { fetchReviews } from './fetch-reviews';

export type GetEnhancedArticle = (doi: Doi) => Promise<EnhancedArticle>;

const getEnhancedArticleWithDependencies = async (doi: Doi, articleRepository: ArticleRepository, reviewingGroupId: string): Promise<EnhancedArticle> => {
  const article = await articleRepository.getArticle(doi);
  const peerReview = await fetchReviews(doi, reviewingGroupId);

  return {
    ...article,
    peerReview,
  };
};

export const createEnhancedArticleGetter = (articleRepository: ArticleRepository, reviewingGroupId: string): GetEnhancedArticle => async (doi: Doi) => getEnhancedArticleWithDependencies(doi, articleRepository, reviewingGroupId);
