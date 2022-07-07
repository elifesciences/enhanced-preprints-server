import { ArticleStruct } from '../../data-loader/data-loader';
import {
  Doi,
  ArticleRepository,
  ProcessedArticle,
  ArticleSummary,
  ArticleContent,
} from '../model';
import { normaliseContentToMarkdown } from '../utils';

class InMemoryArticleRepository implements ArticleRepository {
  store: Map<string, ArticleContent>;

  constructor(store: Map<string, ArticleContent>) {
    this.store = store;
  }

  async storeArticle(article: ArticleContent): Promise<boolean> {
    if (this.store.has(article.doi)) {
      return false;
    }

    this.store.set(article.doi, {
      doi: article.doi,
      xml: article.xml,
      html: article.html,
      json: article.json,
    });

    return true;
  }

  async getArticle(doi: Doi): Promise<ProcessedArticle> {
    const article = this.store.get(doi);
    if (article === undefined) {
      throw new Error(`Article with DOI "${doi}" was not found`);
    }

    const articleStruct = JSON.parse(article.json) as ArticleStruct;

    return {
      doi: article.doi,
      xml: article.xml,
      html: article.html,
      json: article.json,
      title: normaliseContentToMarkdown(articleStruct.title),
      date: new Date(articleStruct.datePublished.value),
      authors: articleStruct.authors,
      abstract: normaliseContentToMarkdown(articleStruct.description),
      licenses: articleStruct.licenses,
      content: normaliseContentToMarkdown(articleStruct.content),
      headings: [],
    };
  }

  async getArticleSummaries(): Promise<ArticleSummary[]> {
    return Array.from(this.store.values()).map((article) => {
      const articleStruct = JSON.parse(article.json) as ArticleStruct;

      // extract title
      const { title } = articleStruct;

      // extract publish date
      const date = new Date(articleStruct.datePublished.value);
      return {
        doi: article.doi,
        title: normaliseContentToMarkdown(title),
        date,
      };
    });
  }
}

export const createInMemoryArticleRepository = async (): Promise<ArticleRepository> => new InMemoryArticleRepository(new Map<string, ArticleContent>());
