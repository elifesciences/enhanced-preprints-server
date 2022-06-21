/* eslint-disable no-underscore-dangle */
import nano, { DocumentScope, MaybeDocument } from 'nano';
import {
  Doi,
  ArticleRepository,
  ProcessedArticle,
  ArticleSummary,
  ArticleContent,
} from '../model';
import { normaliseTitleJson } from '../utils';
import { ArticleStruct } from '../../data-loader/data-loader';

type ArticleDocument = {
  _id: string,
  title: string,
  date: Date,
  doi: string,
} & MaybeDocument;

class CouchDBArticleRepository implements ArticleRepository {
  documentScope: DocumentScope<ArticleDocument>;

  constructor(documentScope: DocumentScope<ArticleDocument>) {
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
      doi: article.doi,
    });

    if (response.ok) {
      const xmlResponse = await this.documentScope.attachment.insert(article.doi, 'xml', article.xml, 'application/xml', { rev: response.rev });
      const jsonResponse = await this.documentScope.attachment.insert(article.doi, 'json', article.json, 'application/json', { rev: xmlResponse.rev });
      const htmlResponse = await this.documentScope.attachment.insert(article.doi, 'html', article.html, 'text/html', { rev: jsonResponse.rev });
      return xmlResponse.ok && jsonResponse.ok && htmlResponse.ok;
    }

    return false;
  }

  async getArticle(doi: Doi): Promise<ProcessedArticle> {
    const article = await this.documentScope.get(doi, { attachments: true });
    if (!article) {
      throw new Error(`Article with DOI "${doi}" was not found`);
    }

    article.title = normaliseTitleJson(article.title);

    return {
      title: article.title,
      date: article.date,
      doi: article.doi,
      xml: Buffer.from(article._attachments.xml.data, 'base64').toString('utf-8'),
      json: Buffer.from(article._attachments.json.data, 'base64').toString('utf-8'),
      html: Buffer.from(article._attachments.html.data, 'base64').toString('utf-8'),
    };
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

export const createCouchDBArticleRepository = async (connectionString: string, username: string, password: string) => {
  const couchServer = await nano({
    url: connectionString,
    requestDefaults: {
      auth: {
        username,
        password,
      },
    },
  });
  const connection = await couchServer.use<ArticleDocument>('epp');

  return new CouchDBArticleRepository(connection);
};
