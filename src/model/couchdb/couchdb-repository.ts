/* eslint-disable no-underscore-dangle */
import nano, { DocumentScope, MaybeDocument } from 'nano';
import {
  Doi,
  ArticleRepository,
  ProcessedArticle,
  ArticleSummary,
  ArticleContent,
} from '../model';
import { contentToHtml } from '../content';
import { ArticleStruct } from '../../data-loader/data-loader';

type ArticleDocument = {
  _id: string,
  doi: string,
  document: ArticleStruct
} & MaybeDocument;

class CouchDBArticleRepository implements ArticleRepository {
  documentScope: DocumentScope<ArticleDocument>;

  constructor(documentScope: DocumentScope<ArticleDocument>) {
    this.documentScope = documentScope;
  }

  async storeArticle(article: ArticleContent): Promise<boolean> {
    const articleStruct = JSON.parse(article.document) as ArticleStruct;

    const response = await this.documentScope.insert({
      _id: article.doi,
      doi: article.doi,
      document: articleStruct,
    });

    if (response.ok) {
      const xmlResponse = await this.documentScope.attachment.insert(article.doi, 'xml', article.xml, 'application/xml', { rev: response.rev });
      const jsonResponse = await this.documentScope.attachment.insert(article.doi, 'json', article.document, 'application/json', { rev: xmlResponse.rev });
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

    const html = Buffer.from(article._attachments.html.data, 'base64').toString('utf-8');

    return {
      title: contentToHtml(article.document.title),
      date: new Date(article.document.datePublished.value),
      doi: article.doi,
      xml: Buffer.from(article._attachments.xml.data, 'base64').toString('utf-8'),
      document: Buffer.from(article._attachments.document.data, 'base64').toString('utf-8'),
      html,
      authors: article.document.authors,
      abstract: contentToHtml(article.document.description),
      licenses: article.document.licenses,
      content: html,
      headings: [],
    };
  }

  async getArticleSummaries(): Promise<ArticleSummary[]> {
    const { docs } = await this.documentScope.find({
      selector: {},
      fields: ['doi', 'json.datePublished.value', 'json.title'],
    });
    return docs.map((doc) => ({
      doi: doc.doi,
      date: new Date(doc.document.datePublished.value),
      title: contentToHtml(doc.document.title),
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
