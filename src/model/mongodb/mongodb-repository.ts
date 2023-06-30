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
} from '../model';
import { Content } from '../content';

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

  async getArticleSummaries(): Promise<ArticleSummary[]> {
    const results = await this.collection.find({}).project({
      doi: 1,
      date: 1,
      title: 1,
    });

    return (await results.toArray()).map<ArticleSummary>((doc) => ({
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
      published: 1,
      article: {
        title: 1,
      },
    });

    return (await results.toArray()).map<ArticleSummary>((doc) => ({
      // eslint-disable-next-line no-underscore-dangle
      id: doc._id,
      doi: doc.doi,
      date: new Date(doc.published),
      title: doc.article.title,
    }));
  }

  async getArticleVersion(identifier: string): Promise<EnhancedArticleWithVersions> {
    const version = await this.versionedCollection.findOne(
      { $or: [{ _id: identifier }, { msid: identifier }] },
      { sort: { preprintPosted: -1 } },
    );

    if (!version) {
      throw Error('Cannot find a matching article version');
    }

    const allVersions = await this.versionedCollection.find<VersionSummary>(
      { msid: version.msid },
      {
        projection: {
          article: 0,
          peerReview: 0,
        },
      },
    );

    const indexedVersions: Record<string, VersionSummary> = (await allVersions.toArray()).reduce((indexed: Record<string, VersionSummary>, current) => {
      const toReturn = indexed;
      toReturn[current.id] = current;
      return toReturn;
    }, {});

    return {
      article: version,
      versions: indexedVersions,
    };
  }

  async deleteArticleVersion(identifier: string): Promise<boolean> {
    const deleteResult = await this.versionedCollection.deleteOne({ _id: identifier });
    return deleteResult.deletedCount > 0;
  }
}

export const createMongoDBArticleRepository = async (host: string, username: string, password: string) => {
  const connectionUrl = `mongodb://${username}:${password}@${host}`;
  const client = new MongoClient(connectionUrl);

  const collection = client.db('epp').collection<StoredArticle>('articles');
  const versionedCollection = client.db('epp').collection<StoredEnhancedArticle>('versioned_articles');
  return new MongoDBArticleRepository(collection, versionedCollection);
};
