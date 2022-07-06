import { Database as SqliteDatabase, Statement } from 'sqlite3';
import { open, Database } from 'sqlite';
import {
  Doi,
  ArticleRepository,
  ProcessedArticle,
  ArticleSummary,
  License,
  Author,
  Section,
} from '../model';

const sqlStatements = {
  insertArticle: `INSERT OR IGNORE INTO articles (
    doi,
    title,
    abstract,
    date,
    authors,
    licenses,
<<<<<<< HEAD
    content
  ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
=======
    sections,
    htmlContent
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
>>>>>>> bcb3d70 (try to add new sections to model)
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
        article.title,
        article.abstract,
        article.date.toUTCString(),
        JSON.stringify(article.authors),
        JSON.stringify(article.licenses),
        JSON.stringify(article.sections),
        article.content,
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
    article.licenses = JSON.parse(article.licenses) as License[];
    article.authors = JSON.parse(article.authors) as Author[];
    article.sections = JSON.parse(article.sections) as Section[];
    return article;
  }

  async getArticleSummaries(): Promise<ArticleSummary[]> {
    const summaries = await this.connection.all<ArticleSummary[]>(sqlStatements.getArticleSummary);
    return summaries.map((articleSummary) => ({
      doi: articleSummary.doi,
      date: new Date(articleSummary.date),
      title: articleSummary.title,
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
