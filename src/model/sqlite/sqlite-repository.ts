import { Database as SqliteDatabase, Statement } from 'sqlite3';
import { open, Database } from 'sqlite';
import {
  Doi,
  ArticleRepository,
  ProcessedArticle,
  ArticleSummary,
  License,
  Author,
  Heading,
} from '../model';
import { Content } from '../content';

const sqlStatements = {
  insertArticle: `INSERT OR IGNORE INTO articles (
    doi,
    html,
    document,
    title,
    abstract,
    date,
    authors,
    licenses,
    headings,
    content
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  getArticle: 'SELECT * FROM articles WHERE doi = ?',
  getArticleSummary: `
    SELECT
      doi,
      date,
      title
    FROM
      articles
  `,
};

class SqliteArticleRepository implements ArticleRepository {
  connection: Database<SqliteDatabase, Statement>;

  constructor(connection: Database<SqliteDatabase, Statement>) {
    this.connection = connection;
  }

  async storeArticle(article: ProcessedArticle): Promise<boolean> {
    const result = await this.connection.run(
      sqlStatements.insertArticle,
      [
        article.doi,
        article.html,
        article.document,
        JSON.stringify(article.title),
        JSON.stringify(article.abstract),
        article.date.toUTCString(),
        JSON.stringify(article.authors),
        JSON.stringify(article.licenses),
        JSON.stringify(article.headings),
        JSON.stringify(article.content),
      ],
    );
    return result.changes === 1;
  }

  async getArticle(doi: Doi): Promise<ProcessedArticle> {
    const article = await this.connection.get(sqlStatements.getArticle, [doi]);
    if (article === undefined) {
      throw new Error(`Article with DOI "${doi}" was not found`);
    }
    // remap date to a Date object
    article.date = new Date(article.date);

    // decode various JSON back to structures
    article.title = JSON.parse(article.title) as Content;
    article.abstract = JSON.parse(article.abstract) as Content;
    article.licenses = JSON.parse(article.licenses) as License[];
    article.authors = JSON.parse(article.authors) as Author[];
    article.headings = JSON.parse(article.headings) as Heading[];
    article.content = JSON.parse(article.content) as Content;
    return article;
  }

  async getArticleSummaries(): Promise<ArticleSummary[]> {
    const summaries = await this.connection.all(sqlStatements.getArticleSummary);
    return summaries.map((articleSummary) => ({
      doi: articleSummary.doi,
      date: new Date(articleSummary.date),
      title: JSON.parse(articleSummary.title) as Content,
    }));
  }
}

export const createSqliteArticleRepository = async (connectionString: string) => {
  const connection = await open({
    filename: connectionString,
    driver: SqliteDatabase,
  });

  await connection.migrate({
    migrationsPath: 'migrations/sqlite',
  });

  return new SqliteArticleRepository(connection);
};
