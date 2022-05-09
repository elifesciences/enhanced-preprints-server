import { Doi, ArticleRepository, ProcessedArticle, ArticleSummary } from "../model";

class InMemoryArticleRepository implements ArticleRepository {
  store: Map<string, ProcessedArticle>;
  constructor(store: Map<string, ProcessedArticle>) {
    this.store = store;
  }
  async storeArticle(article: ProcessedArticle): Promise<boolean> {
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
  async getArticle(doi: Doi): Promise<ProcessedArticle> {
    const article = this.store.get(doi);
    if (article === undefined) {
      throw new Error(`Article with DOI "${doi}" was not found`);
    }
    return article;
  }

  async getArticleSummaries(): Promise<ArticleSummary[]> {
    return Array.from(this.store.values()).map((article) => {
      return {
        doi: article.doi,
        title: article.title,
        date: article.date,
      };
    });
  }
}

export const createInMemoryArticleRepository = async (): Promise<ArticleRepository> => {
  return new InMemoryArticleRepository(new Map<string, ProcessedArticle>());
}
