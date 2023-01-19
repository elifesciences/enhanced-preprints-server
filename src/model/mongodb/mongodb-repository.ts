import { Collection, MongoClient } from 'mongodb';
import {
  ArticleAbstract,
  ArticleRepository,
  ArticleSummary,
  ArticleTitle,
  Author, Doi,
  Heading,
  License,
  ProcessedArticle,
  Reference,
  VersionedArticle,
  VersionedArticlesWithVersions,
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
  headings: Heading[],
  references: Reference[],
};

type StoredVersionedArticle = VersionedArticle & {
  _id: string,
};

class MongoDBArticleRepository implements ArticleRepository {
  private collection: Collection<StoredArticle>;

  private versionedCollection: Collection<StoredVersionedArticle>;

  constructor(collection: Collection<StoredArticle>, versionedCollection: Collection<StoredVersionedArticle>) {
    this.collection = collection;
    this.versionedCollection = versionedCollection;
  }

  async storeArticle(article: ProcessedArticle): Promise<boolean> {
    const response = await this.collection.insertOne({
      _id: article.doi,
      title: article.title,
      abstract: article.abstract,
      authors: article.authors,
      content: article.content,
      date: article.date,
      doi: article.doi,
      headings: article.headings,
      licenses: article.licenses,
      references: article.references,
    });

    return response.acknowledged;
  }

  async getArticle(doi: Doi): Promise<ProcessedArticle> {
    const article = await this.collection.findOne({ _id: doi });
    if (!article) {
      throw new Error(`Article with DOI "${doi}" was not found`);
    }

    return {
      ...article,
      date: new Date(article.date),
    };
  }

  async getArticleSummaries(): Promise<ArticleSummary[]> {
    const results = await this.collection.find({}).project<ArticleSummary>({
      doi: 1,
      date: 1,
      title: 1,
    });

    return (await results.toArray()).map<ArticleSummary>((doc) => ({
      doi: doc.doi,
      date: new Date(doc.date),
      title: doc.title,
    }));
  }

  async storeVersionedArticle(article: VersionedArticle): Promise<boolean> {
    const response = await this.collection.insertOne({
      _id: article.id,
      ...article,
    });

    return response.acknowledged;
  }

  async getArticleVersion(identifier: string): Promise<VersionedArticlesWithVersions> {
    const allVersions = await this.versionedCollection.find({ $or: [{ _id: identifier }, { msid: identifier }] })
      .sort({ preprintPosted: -1 }) // sorted descending
      .toArray();

    if (allVersions.length === 0) {
      throw Error('Cannot find a matching article Version');
    }

    const askedForVersion = allVersions.filter((version) => version.id === identifier);
    if (askedForVersion.length === 1) {
      return {
        current: askedForVersion[0],
        versions: allVersions.reduce((record: Record<string, VersionedArticle>, otherVersion) => {
          const toReturn = record;
          toReturn[otherVersion.id] = otherVersion;
          return toReturn;
        }, {}),
      };
    }
    return {
      current: allVersions.slice(-1)[0],
      versions: allVersions.reduce((record: Record<string, VersionedArticle>, otherVersion) => {
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
  const versionedCollection = client.db('epp').collection<StoredVersionedArticle>('versioned_articles');
  return new MongoDBArticleRepository(collection, versionedCollection);
};
