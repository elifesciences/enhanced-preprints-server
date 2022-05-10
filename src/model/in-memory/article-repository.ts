import { Doi, ArticleRepository, ProcessedArticle, ArticleSummary, ArticleContent, ArticleStruct } from "../model";

class InMemoryArticleRepository implements ArticleRepository {
  store: Map<string, ProcessedArticle>;
  constructor(store: Map<string, ProcessedArticle>) {
    this.store = store;
  }
  async storeArticle(article: ArticleContent): Promise<boolean> {
    const articleStruct = JSON.parse(article.json) as ArticleStruct;

    // extract title
    const title = articleStruct.title;

    // extract publish date
    const date = new Date(articleStruct.datePublished.value);

    this.store.set(article.doi, {
      doi: article.doi,
      xml: article.xml,
      title: title,
      html: article.html,
      json: article.json,
      date: date,
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
