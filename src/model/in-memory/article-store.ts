import { Doi, EnhancedArticle, ArticleStore, ProcessedArticle, Review, ReviewingGroupId } from "../model";

class InMemoryArticleStore implements ArticleStore {
  store: Map<string, EnhancedArticle>;
  constructor(store: Map<string, EnhancedArticle>) {
    this.store = store;
  }
  storeArticle(article: ProcessedArticle, reviewingGroupId: ReviewingGroupId): boolean {
    //transform XML into HTML and JSON
    //extract title form JSON

    this.store.set(article.doi, {
      doi: article.doi,
      reviewingGroupId: reviewingGroupId,
      xml: article.xml,
      title: article.title,
      html: article.html,
      json: article.json,
      previousVersions: [],
      date: article.date,
    });

    return true;
  }
  getArticle(doi: Doi): EnhancedArticle {
    const enhancedArticle = this.store.get(doi);
    if (enhancedArticle === undefined) {
      throw new Error(`Article with DOI "${enhancedArticle}" was not found`);
    }
    return enhancedArticle;
  }
  addReview(doi: Doi, review: Review): boolean {
    const article = this.getArticle(doi);
    const reviewedArticle = {
      doi: article.doi,
      date: article.date,
      reviewingGroupId: article.reviewingGroupId,
      xml: article.xml,
      title: article.title,
      html: article.html,
      json: article.json,
      previousVersions: article.previousVersions,
      review: review
    };
    reviewedArticle.previousVersions.push(article);

    this.store.set(article.doi, reviewedArticle);
    return true;
  }
  getArticlesForReviewingGroup(reviewingGroupId: ReviewingGroupId): EnhancedArticle[] {
    return Array.from(this.store.values()).filter((article) => article.reviewingGroupId === reviewingGroupId);
  }
}

export const createInMemoryArticleStore = () => {
  return new InMemoryArticleStore(new Map<string, EnhancedArticle>());
}
