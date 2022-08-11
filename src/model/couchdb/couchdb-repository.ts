/* eslint-disable no-underscore-dangle */
import nano, { DocumentScope, MaybeDocument } from 'nano';
import { Content } from '../content';
import {
  Doi,
  ArticleRepository,
  ProcessedArticle,
  ArticleSummary,
  ArticleTitle,
  ArticleAbstract,
  License,
  Heading,
  Author,
} from '../model';

type StoredArticle = {
  _id: string,
  doi: string,
  title: ArticleTitle,
  date: Date,
  authors: Author[],
  abstract: ArticleAbstract,
  licenses: License[],
  content: Content,
  headings: Heading[],
} & MaybeDocument;

class CouchDBArticleRepository implements ArticleRepository {
  documentScope: DocumentScope<StoredArticle>;

  constructor(documentScope: DocumentScope<StoredArticle>) {
    this.documentScope = documentScope;
  }

  async storeArticle(article: ProcessedArticle): Promise<boolean> {
    const response = await this.documentScope.insert({
      _id: article.doi,
      title: article.title,
      abstract: article.abstract,
      authors: article.authors,
      content: article.content,
      date: article.date,
      doi: article.doi,
      headings: article.headings,
      licenses: article.licenses,
    });

    if (!response.ok) {
      return false;
    }

    const htmlResponse = await this.documentScope.attachment.insert(article.doi, 'html', article.html, 'text/html', { rev: response.rev });

    return htmlResponse.ok;
  }

  async getArticle(doi: Doi): Promise<ProcessedArticle> {
    const article = await this.documentScope.get(doi, { attachments: true });
    if (!article) {
      throw new Error(`Article with DOI "${doi}" was not found`);
    }

    const html = Buffer.from(article._attachments.html.data, 'base64').toString('utf-8');

    return {
      ...article,
      date: new Date(article.date),
      html,
    };
  }

  async getArticleSummaries(): Promise<ArticleSummary[]> {
    const { rows } = await this.documentScope.view<ArticleSummary>('article-summaries', 'article-summaries');
    return rows.map((row) => ({
      doi: row.value.doi,
      date: new Date(row.value.date),
      title: row.value.title,
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
  const connection = couchServer.use<StoredArticle>('epp');
  return new CouchDBArticleRepository(connection);
};
