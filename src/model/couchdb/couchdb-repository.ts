import nano, { DocumentScope } from 'nano';
import {
  Doi,
  ArticleRepository,
  ProcessedArticle,
  ArticleSummary,
  ArticleContent,
} from '../model';
import { normaliseTitleJson } from '../utils';
import { ArticleStruct } from '../../data-loader/data-loader';

class CouchDBArticleRepository implements ArticleRepository {
  documentScope: DocumentScope<ProcessedArticle>;

  constructor(documentScope: DocumentScope<ProcessedArticle>) {
    this.documentScope = documentScope;
  }

  async storeArticle(article: ArticleContent): Promise<boolean> {
    const articleStruct = JSON.parse(article.json) as ArticleStruct;

    // extract title
    const { title } = articleStruct;

    // extract publish date
    const date = new Date(articleStruct.datePublished.value);

    const response = await this.documentScope.insert({
      _id: article.doi,
      title,
      date,
      ...article,
    });

    return response.ok;
  }

  async getArticle(doi: Doi): Promise<ProcessedArticle> {
    const article = await this.documentScope.get(doi);
    if (!article) {
      throw new Error(`Article with DOI "${doi}" was not found`);
    }
    // remap date to a Date object
    article.title = normaliseTitleJson(article.title);

    return article;
  }

  async getArticleSummaries(): Promise<ArticleSummary[]> {
    const { rows } = await this.documentScope.list({ include_docs: true });
    return rows.reduce((previousValue, currentValue) => {
      if (currentValue.doc) {
        previousValue.push({
          doi: currentValue.doc.doi,
          date: new Date(currentValue.doc.date),
          title: normaliseTitleJson(currentValue.doc.title),
        });
      }
      return previousValue;
    }, new Array<ArticleSummary>());
  }
}

export const createCouchDBArticleRepository = async (connectionString: string) => {
  const couchServer = await nano({
    url: connectionString,
    requestDefaults: {
      auth: {
        username: 'admin',
        password: 'rose',
      },
    },
  });
  const connection = await couchServer.use<ProcessedArticle>('epp');

  return new CouchDBArticleRepository(connection);
};
