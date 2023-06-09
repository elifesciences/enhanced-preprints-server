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
    const response = await this.versionedCollection.insertOne({
      _id: article.id,
      ...article,
    });

    return response.acknowledged;
  }

  async getArticleVersion(identifier: string): Promise<EnhancedArticleWithVersions> {
    const allVersions = await this.versionedCollection.find({ $or: [{ _id: identifier }, { msid: identifier }] })
      .sort({ preprintPosted: -1 }) // sorted descending
      .toArray();

    if (allVersions.length === 0) {
      throw Error('Cannot find a matching article Version');
    }

    const askedForVersion = allVersions.filter((version) => version.id === identifier);
    if (askedForVersion.length === 1) {
      return {
        article: askedForVersion[0],
        versions: allVersions.reduce((record: Record<string, EnhancedArticle>, otherVersion) => {
          const toReturn = record;
          toReturn[otherVersion.id] = otherVersion;
          return toReturn;
        }, {}),
      };
    }
    return {
      article: allVersions.slice(-1)[0],
      versions: allVersions.reduce((record: Record<string, EnhancedArticle>, otherVersion) => {
        const toReturn = record;
        toReturn[otherVersion.id] = otherVersion;
        return toReturn;
      }, {}),
    };
  }
}

export const createMongoDBArticleRepository = async (host: string, username: string, password: string) => {
  const connectionUrl = `mongodb://${username}:${password}@${host}`;
  const client = new MongoClient(connectionUrl);

  const collection = client.db('epp').collection<StoredArticle>('articles');
  const versionedCollection = client.db('epp').collection<StoredEnhancedArticle>('versioned_articles');
  return new MongoDBArticleRepository(collection, versionedCollection);
};
