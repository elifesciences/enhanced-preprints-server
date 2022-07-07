import { Database as SqliteDatabase, Statement } from 'sqlite3';
import { open, Database } from 'sqlite';
import {
  Doi,
  ArticleRepository,
  ProcessedArticle,
  ArticleSummary,
  ArticleContent,
  License,
  Author,
} from '../model';
import { normaliseContentToMarkdown } from '../utils';

const sqlStatements = {
  insertArticle: 'INSERT OR IGNORE INTO articles (doi, xml, html, json) VALUES (?, ?, ?, ?)',
  getArticle: `
    SELECT
      articles.doi as "doi",
      articles.date as "date",
      articles.title as "title",
      articles.xml as "xml",
      articles.json as "json",
      articles.html as "html",
      articles.authors as "authors",
      articles.abstract as "abstract",
      articles.licenses as "licenses",
      articles.content as "content"
    FROM
      articles
    WHERE doi = ?
  `,
  getArticleSummary: `
    SELECT
    articles.doi as "doi",
      articles.date as "date",
      articles.title as "title"
    FROM
      articles
  `,
};

class SqliteArticleRepository implements ArticleRepository {
  connection: Database<SqliteDatabase, Statement>;

  constructor(connection: Database<SqliteDatabase, Statement>) {
    this.connection = connection;
  }

  async storeArticle(article: ArticleContent): Promise<boolean> {
    const result = await this.connection.run(
      sqlStatements.insertArticle,
      [
        article.doi,
        article.xml,
        article.html,
        article.json,
      ],
    );
    return result.changes === 1;
  }

  async getArticle(doi: Doi): Promise<ProcessedArticle> {
    const article = await this.connection.get(sqlStatements.getArticle, [doi]);
    if (article === undefined) {
      throw new Error(`Article with DOI "${doi}" was not found`);
    }

    return {
      doi: article.doi,
      date: new Date(article.date),
      title: normaliseContentToMarkdown(article.title),
      xml: article.xml,
      json: article.json,
      html: article.html,
      authors: JSON.parse(article.authors) as Author[],
      abstract: normaliseContentToMarkdown(article.abstract),
      licenses: JSON.parse(article.licenses) as License[],
      content: normaliseContentToMarkdown(article.content),
      headings: [],
    };
  }

  async getArticleSummaries(): Promise<ArticleSummary[]> {
    const summaries = await this.connection.all<ArticleSummary[]>(sqlStatements.getArticleSummary);
    return summaries.map((articleSummary) => ({
      doi: articleSummary.doi,
      date: new Date(articleSummary.date),
      title: normaliseContentToMarkdown(articleSummary.title),
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
