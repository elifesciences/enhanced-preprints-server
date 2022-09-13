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
  html: string,
};

class MongoDBArticleRepository implements ArticleRepository {
  private collection: Collection<StoredArticle>;

  constructor(collection: Collection<StoredArticle>) {
    this.collection = collection;
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
      html: article.html,
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
}

export const createMongoDBArticleRepository = async (host: string, username: string, password: string) => {
  const connectionUrl = `mongodb://${username}:${password}@${host}`;
  const client = new MongoClient(connectionUrl);

  const collection = client.db('epp').collection<StoredArticle>('articles');
  return new MongoDBArticleRepository(collection);
};
