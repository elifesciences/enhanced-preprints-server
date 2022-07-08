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
import { Content } from '../content';

const sqlStatements = {
  insertArticle: 'INSERT OR IGNORE INTO articles (doi, xml, html, document) VALUES (?, ?, ?, ?)',
  getArticle: `
    SELECT
      articles.doi as "doi",
      articles.date as "date",
      articles.title as "title",
      articles.xml as "xml",
      articles.document as "document",
      articles.html as "html",
      articles.authors as "authors",
      articles.abstract as "abstract",
      articles.licenses as "licenses",
      articles.content as "content"
    FROM
      articles
    WHERE doi = ?
  `,
  getArticleHeadings: `
    SELECT
      json_extract(json_each.value, '$.type') as "type",
      json_extract(json_each.value, '$.id') as "id",
      json_extract(json_each.value, '$.depth') as "depth",
      json_extract(json_each.value, '$.content') as "content"
    FROM articles, json_each(articles.content)
    WHERE doi = ?
    AND json_extract(json_each.value, '$.type') = 'Heading'
    AND json_extract(json_each.value, '$.depth') < 2
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

type ArticleHeading = {
  type: 'Heading'
  id: string,
  depth: number
  content: Content,
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
        article.document,
      ],
    );
    return result.changes === 1;
  }

  async getArticle(doi: Doi): Promise<ProcessedArticle> {
    const article = await this.connection.get(sqlStatements.getArticle, [doi]);
    if (article === undefined) {
      throw new Error(`Article with DOI "${doi}" was not found`);
    }

    const headingsResults = await this.connection
      .all<ArticleHeading[]>(sqlStatements.getArticleHeadings, [doi]);

    return {
      doi: article.doi,
      date: new Date(article.date),
      title: article.title,
      xml: article.xml,
      document: article.document,
      html: article.html,
      authors: JSON.parse(article.authors) as Author[],
      abstract: article.abstract,
      licenses: JSON.parse(article.licenses) as License[],
      content: article.content,
      headings: headingsResults.map((heading) => ({
        id: heading.id,
        text: heading.content,
      })),
    };
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
