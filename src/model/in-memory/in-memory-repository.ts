import { ArticleStruct } from '../../data-loader/data-loader';
import {
  Doi,
  ArticleRepository,
  ProcessedArticle,
  ArticleSummary,
  ArticleContent,
} from '../model';
import { normaliseTitleJson } from '../utils';

class InMemoryArticleRepository implements ArticleRepository {
  store: Map<string, ProcessedArticle>;

  constructor(store: Map<string, ProcessedArticle>) {
    this.store = store;
  }

  async storeArticle(article: ArticleContent): Promise<boolean> {
    if (this.store.has(article.doi)) {
      return false;
    }
    const articleStruct = JSON.parse(article.json) as ArticleStruct;

    // extract title
    const { title } = articleStruct;

    // extract publish date
    const date = new Date(articleStruct.datePublished.value);

    this.store.set(article.doi, {
      doi: article.doi,
      xml: article.xml,
      html: article.html,
      json: article.json,
      title,
      date,
    });

    return true;
  }

  async getArticle(doi: Doi): Promise<ProcessedArticle> {
    const article = this.store.get(doi);
    if (article === undefined) {
      throw new Error(`Article with DOI "${doi}" was not found`);
    }

    return {
      doi: article.doi,
      xml: article.xml,
      title: normaliseTitleJson(article.title),
      html: article.html,
      json: article.json,
      date: article.date,
    };
  }

  async getArticleSummaries(): Promise<ArticleSummary[]> {
    return Array.from(this.store.values()).map((article) => ({
      doi: article.doi,
      title: normaliseTitleJson(article.title),
      date: article.date,
    }));
  }
}

export const createInMemoryArticleRepository = async (): Promise<ArticleRepository> => new InMemoryArticleRepository(new Map<string, ProcessedArticle>());
