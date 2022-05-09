import { Doi, ArticleRepository, ProcessedArticle, ArticleSummary } from "../model";

class InMemoryArticleRepository implements ArticleRepository {
  store: Map<string, ProcessedArticle>;
  constructor(store: Map<string, ProcessedArticle>) {
    this.store = store;
  }
  storeArticle(article: ProcessedArticle): boolean {
    this.store.set(article.doi, {
      doi: article.doi,
      xml: article.xml,
      title: article.title,
      html: article.html,
      json: article.json,
      date: article.date,
    });

    return true;
  }
  getArticle(doi: Doi): ProcessedArticle {
    const article = this.store.get(doi);
    if (article === undefined) {
      throw new Error(`Article with DOI "${doi}" was not found`);
    }
    return article;
  }

  getArticleSummaries(): ArticleSummary[] {
    return Array.from(this.store.values()).map((article) => {
      return {
        doi: article.doi,
        title: article.title,
        date: article.date,
      };
    });
  }
}

export const createInMemoryArticleRepository = () => {
  return new InMemoryArticleRepository(new Map<string, ProcessedArticle>());
}
