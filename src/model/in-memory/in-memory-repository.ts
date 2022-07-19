import {
  Doi,
  ArticleRepository,
  ProcessedArticle,
  ArticleSummary,
} from '../model';

class InMemoryArticleRepository implements ArticleRepository {
  store: Map<string, ProcessedArticle>;

  constructor(store: Map<string, ProcessedArticle>) {
    this.store = store;
  }

  async storeArticle(article: ProcessedArticle): Promise<boolean> {
    if (this.store.has(article.doi)) {
      return false;
    }

    this.store.set(article.doi, article);

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
    return Array.from(this.store.values()).map((article) => ({
      doi: article.doi,
      title: article.title,
      date: article.date,
    }));
  }
}

export const createInMemoryArticleRepository = async (): Promise<ArticleRepository> => new InMemoryArticleRepository(new Map<string, ProcessedArticle>());
