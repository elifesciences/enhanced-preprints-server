import { Collection, MongoClient } from 'mongodb';
import {
  ArticleAbstract,
  ArticleRepository,
  ArticleSummary,
  ArticleTitle,
  Author,
  License,
  ProcessedArticle,
  Reference,
  EnhancedArticle,
  EnhancedArticleWithVersions,
  VersionSummary,
  EnhancedArticleNoContent,
  EnhancedArticleNoContentTotal,
  ArticleSummaryWithoutMSID,
} from '../model';
import { Content } from '../content';
import { logger } from '../../utils/logger';

type StoredArticle = {
  _id: string,
  doi: string,
  title: ArticleTitle,
  date: Date,
  authors: Author[],
  abstract: ArticleAbstract,
  licenses: License[],
  content: Content,
  references: Reference[],
};

type StoredEnhancedArticle = EnhancedArticle & {
  _id: string,
};

class MongoDBArticleRepository implements ArticleRepository {
  private collection: Collection<StoredArticle>;

  private versionedCollection: Collection<StoredEnhancedArticle>;

  constructor(collection: Collection<StoredArticle>, versionedCollection: Collection<StoredEnhancedArticle>) {
    this.collection = collection;
    this.versionedCollection = versionedCollection;
  }

  async storeArticle(article: ProcessedArticle, id: string): Promise<boolean> {
    const response = await this.collection.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          _id: id,
          title: article.title,
          abstract: article.abstract,
          authors: article.authors,
          content: article.content,
          date: article.date,
          doi: article.doi,
          licenses: article.licenses,
          references: article.references,
        },
      },
      {
        upsert: true,
      },
    );

    return response.acknowledged;
  }

  async getArticle(id: string): Promise<ProcessedArticle> {
    const article = await this.collection.findOne({ _id: id });
    if (!article) {
      throw new Error(`Article with ID "${id}" was not found`);
    }

    return {
      ...article,
      date: new Date(article.date),
    };
  }

  async getArticleSummaries(): Promise<ArticleSummaryWithoutMSID[]> {
    const results = await this.collection.find({}).project({
      doi: 1,
      date: 1,
      title: 1,
    });

    return (await results.toArray()).map<ArticleSummaryWithoutMSID>((doc) => ({
      // eslint-disable-next-line no-underscore-dangle
      id: doc._id,
      doi: doc.doi,
      date: new Date(doc.date),
      title: doc.title,
    }));
  }

  async storeEnhancedArticle(article: EnhancedArticle): Promise<boolean> {
    const response = await this.versionedCollection.updateOne({
      _id: article.id,
    }, {
      $set: {
        _id: article.id,
        ...article,
      },
    }, {
      upsert: true,
    });

    return response.acknowledged;
  }

  async getEnhancedArticleSummaries(): Promise<ArticleSummary[]> {
    const results = await this.versionedCollection.find({}).project({
      doi: 1,
      msid: 1,
      published: 1,
      article: {
        title: 1,
      },
    });

    return (await results.toArray()).map<ArticleSummary>((doc) => ({
      // eslint-disable-next-line no-underscore-dangle
      id: doc._id,
      doi: doc.doi,
      msid: doc.msid,
      date: doc.published ? new Date(doc.published) : null,
      title: doc.article.title,
    }));
  }

  async findArticleVersion(identifier: string, previews: boolean = false): Promise<EnhancedArticleWithVersions | null> {
    const previewFilter = previews ? {} : { published: { $lte: new Date() } };
    const version = await this.versionedCollection.findOne(
      { $or: [{ _id: identifier }, { msid: identifier }], ...previewFilter },
      {
        sort: { preprintPosted: -1 },
        projection: {
          _id: 0,
        },
      },
    );

    if (!version) {
      return null;
    }

    const allVersions = await this.versionedCollection.find<VersionSummary>(
      { msid: version.msid, ...previewFilter },
      {
        projection: {
          article: 0,
          peerReview: 0,
          _id: 0,
        },
      },
    ).toArray();

    const indexedVersions: Record<string, VersionSummary> = allVersions.reduce((indexed: Record<string, VersionSummary>, current) => {
      const toReturn = indexed;
      toReturn[current.id] = current;
      return toReturn;
    }, {});

    return {
      // Temporary hack to bring in line with current prod.
      // See: https://github.com/elifesciences/enhanced-preprints-server/blob/276bf4e39607d3cbceb2cb18cadfdd00c2ba695b/src/services/reviews/fetch-reviews.ts#L91-L92
      // See: https://github.com/elifesciences/enhanced-preprints-issues/issues/939
      article: version.peerReview ? { ...version, peerReview: { ...version.peerReview, reviews: version.peerReview.reviews.reverse() } } : version,
      versions: indexedVersions,
    };
  }

  async getEnhancedArticlesNoContent(page: number | null, perPage: number | null, order: 'asc' | 'desc'): Promise<EnhancedArticleNoContent[]> {
    const allVersions = await this.versionedCollection.aggregate<EnhancedArticleNoContent>([
      {
        $match: {
          $and: [
            { published: { $ne: null } },
            { published: { $lte: new Date() } },
          ],
        },
      },
      {
        $project: {
          'article.content': 0,
          'article.abstract': 0,
          'article.doi': 0,
          'article.date': 0,
          'article.licenses': 0,
          'article.references': 0,
          peerReview: 0,
          _id: 0,
        },
      },
      {
        $sort: { published: -1 },
      },
      {
        $group: {
          _id: '$msid',
          mostRecentDocument: { $first: '$$ROOT' },
          publishedDate: { $max: '$published' },
          firstPublished: { $min: '$published' },
        },
      },
      {
        $addFields: {
          'mostRecentDocument.firstPublished': '$firstPublished',
        },
      },
      {
        $sort: { publishedDate: (order === 'asc') ? 1 : -1, _id: (order === 'asc') ? 1 : -1 },
      },
      {
        $replaceRoot: { newRoot: '$mostRecentDocument' },
      },
      ...(typeof page === 'number' && typeof perPage === 'number') ? [
        {
          $skip: (page - 1) * perPage,
        },
        {
          $limit: perPage,
        },
      ] : [],
    ]).toArray();

    return allVersions;
  }

  async getEnhancedArticlesNoContentTotal(): Promise<number> {
    const count = await this.versionedCollection.aggregate<EnhancedArticleNoContentTotal>([
      {
        $match: {
          $and: [
            { published: { $ne: null } },
            { published: { $lte: new Date() } },
          ],
        },
      },
      {
        $sort: { published: -1 },
      },
      {
        $group: {
          _id: '$msid',
          mostRecentDocument: { $first: '$$ROOT' },
          publishedDate: { $max: '$published' },
        },
      },
      {
        $count: 'total',
      },
    ]).next();

    return count?.total || 0;
  }

  async deleteArticleVersion(identifier: string): Promise<boolean> {
    const deleteResult = await this.versionedCollection.deleteOne({ _id: identifier });
    return deleteResult.deletedCount > 0;
  }
}

export const createMongoDBArticleRepositoryFromMongoClient = async (client: MongoClient) => {
  const collection = client.db('epp').collection<StoredArticle>('articles');
  const versionedCollection = client.db('epp').collection<StoredEnhancedArticle>('versioned_articles');
  const result1 = await versionedCollection.createIndex({ msid: -1 });
  const result2 = await versionedCollection.createIndex({ published: -1 });
  logger.info(`created index: ${result1} and ${result2}`);

  return new MongoDBArticleRepository(collection, versionedCollection);
};

export const createMongoDBArticleRepository = async (host: string, username: string, password: string) => createMongoDBArticleRepositoryFromMongoClient(new MongoClient(`mongodb://${username}:${password}@${host}`));
