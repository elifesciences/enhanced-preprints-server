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
  headings: Heading[],
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

  async storeArticle(article: ProcessedArticle, isPreview: boolean = false): Promise<boolean> {
    const id = `${isPreview ? 'preview--' : ''}${article.doi}`;
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
          headings: article.headings,
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
