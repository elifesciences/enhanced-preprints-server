/* eslint-disable no-underscore-dangle */
import nano, { DocumentScope, MaybeDocument } from 'nano';
import {
  Doi,
  ArticleRepository,
  ProcessedArticle,
  ArticleSummary,
} from '../model';

type ArticleDocument = {
  _id: string,
} & ProcessedArticle & MaybeDocument;

class CouchDBArticleRepository implements ArticleRepository {
  documentScope: DocumentScope<ArticleDocument>;

  constructor(documentScope: DocumentScope<ArticleDocument>) {
    this.documentScope = documentScope;
  }

  async storeArticle(article: ProcessedArticle): Promise<boolean> {
    const response = await this.documentScope.insert({
      _id: article.doi,
      ...article,
    });

    return response.ok;
  }

  async getArticle(doi: Doi): Promise<ProcessedArticle> {
    const article = await this.documentScope.get(doi, { attachments: true });
    if (!article) {
      throw new Error(`Article with DOI "${doi}" was not found`);
    }

    return {
      ...article,
      date: new Date(article.date),
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
  const connection = couchServer.use<ArticleDocument>('epp');
  return new CouchDBArticleRepository(connection);
};
