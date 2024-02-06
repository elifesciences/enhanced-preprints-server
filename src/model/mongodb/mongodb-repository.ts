import { Collection, MongoClient } from 'mongodb';
import {
  ArticleAbstract,
  ArticleRepository,
  ArticleSummary,
  ArticleTitle,
  Author,
  License,
  Reference,
  EnhancedArticle,
  EnhancedArticleWithVersions,
  VersionSummary,
  EnhancedArticleNoContent,
  EnhancedArticlesNoContentWithTotal,
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

  async getEnhancedArticlesNoContent(page: number | null, perPage: number | null, order: 'asc' | 'desc', startDate: string | null, endDate: string | null, useDate: 'firstPublished' | null): Promise<EnhancedArticlesNoContentWithTotal> {
    const useDateField = useDate ?? 'statusDate';
    const allVersions = await this.versionedCollection.aggregate<{ totalCount: { _id: null, totalCount: number }[], articles: [EnhancedArticleNoContent] }>([
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
        $group: {
          _id: '$msid',
          mostRecentDocument: { $first: '$$ROOT' },
          statusDate: { $max: '$published' },
          firstPublished: { $min: '$published' },
        },
      },
      ...(startDate || endDate) ? [
        {
          $match: {
            $and: [
              ...(startDate ? [{ [useDateField]: { $gte: new Date(startDate) } }] : []),
              ...(endDate ? [{ [useDateField]: { $lt: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)) } }] : []),
            ],
          },
        },
      ] : [],
      {
        $facet: {
          totalCount: [
            {
              $group: {
                _id: null,
                totalCount: { $sum: 1 },
              },
            },
          ],
          articles: [
            {
              $sort: { [useDateField]: (order === 'asc') ? 1 : -1, _id: (order === 'asc') ? 1 : -1 },
            },
            ...(typeof page === 'number' && typeof perPage === 'number') ? [
              {
                $skip: (page - 1) * perPage,
              },
              {
                $limit: perPage,
              },
            ] : [],
            {
              $addFields: {
                'mostRecentDocument.firstPublished': '$firstPublished',
              },
            },
            {
              $replaceRoot: { newRoot: '$mostRecentDocument' },
            },
          ],
        },
      },
    ]).toArray();

    return {
      totalCount: allVersions[0].totalCount[0] ? allVersions[0].totalCount[0].totalCount : 0,
      articles: allVersions[0].articles,
    };
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
