/* eslint-disable no-underscore-dangle */
import nano, { DocumentScope, MaybeDocument } from 'nano';
import {
  Doi,
  ArticleRepository,
  ProcessedArticle,
  ArticleSummary,
  ArticleContent,
} from '../model';
import { normaliseContentToMarkdown, normaliseContentToText } from '../utils';
import { ArticleStruct } from '../../data-loader/data-loader';

type ArticleDocument = {
  _id: string,
  doi: string,
  json: ArticleStruct
} & MaybeDocument;

class CouchDBArticleRepository implements ArticleRepository {
  documentScope: DocumentScope<ArticleDocument>;

  constructor(documentScope: DocumentScope<ArticleDocument>) {
    this.documentScope = documentScope;
  }

  async storeArticle(article: ArticleContent): Promise<boolean> {
    const articleStruct = JSON.parse(article.json) as ArticleStruct;

    const response = await this.documentScope.insert({
      _id: article.doi,
      doi: article.doi,
      json: articleStruct,
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

    return {
      title: normaliseContentToText(article.json.title),
      date: new Date(article.json.datePublished.value),
      doi: article.doi,
      xml: Buffer.from(article._attachments.xml.data, 'base64').toString('utf-8'),
      json: Buffer.from(article._attachments.json.data, 'base64').toString('utf-8'),
      html: Buffer.from(article._attachments.html.data, 'base64').toString('utf-8'),
      authors: article.json.authors,
      abstract: normaliseContentToMarkdown(article.json.description),
      licenses: article.json.licenses,
    };
  }

  async getArticleSummaries(): Promise<ArticleSummary[]> {
    const { rows } = await this.documentScope.view<ArticleSummary>('article-summaries', 'article-summaries');
    return rows.map((row) => ({
      doi: row.value.doi,
      date: new Date(row.value.date),
      title: normaliseContentToMarkdown(row.value.title),
    }));
  }
}

export const createCouchDBArticleRepository = async (connectionString: string, username: string, password: string) => {
  const couchServer = nano({
    url: connectionString,
    requestDefaults: {
      auth: {
        username,
        password,
      },
    },
  });
  await couchServer.use('epp').head('_design/article-summaries', async (error) => {
    if (error) {
      await couchServer.use('epp').insert(
        {
          _id: '_design/article-summaries',
          views: {
            'article-summaries': {
              map: 'function (doc) {\n  emit(doc._id, { doi: doc.doi, title: doc.title, date: doc.date});\n}',
            },
          },
        },
      );
    }
  });
  const connection = couchServer.use<ArticleDocument>('epp');
  return new CouchDBArticleRepository(connection);
};
