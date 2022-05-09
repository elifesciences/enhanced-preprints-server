import { ArticleRepository, Doi, EnhancedArticle, Review, ReviewType } from "../model/model";
import { fetchReviews } from "./fetch-reviews";


export type getEnhancedArticle = (doi: Doi) => Promise<EnhancedArticle>;

const getEnhancedArticleWithDependencies = async (doi: Doi, articleRepository: ArticleRepository, reviewingGroupId: string): Promise<EnhancedArticle> => {
  const article = articleRepository.getArticle(doi);
  const reviewTexts = await fetchReviews(doi, reviewingGroupId);

  const reviews = reviewTexts.map((reviewText: string): Review => {
    return {
      date: new Date(),
      reviewType: ReviewType.EvaluationSummary,
      text: reviewText,
      reviewOf: article,
    }
  });
  return {
    doi: article.doi,
    title: article.title,
    date: article.date,
    xml: article.xml,
    html: article.html,
    json: article.json,
    reviews: reviews,
  }
}

export const createEnhancedArticleGetter = (articleRepository: ArticleRepository, reviewingGroupId: string): getEnhancedArticle => {
  return async (doi: Doi) => await getEnhancedArticleWithDependencies(doi, articleRepository, reviewingGroupId);
}
