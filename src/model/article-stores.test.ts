import { StoreType } from "./model";
import { createInMemoryArticleRepository } from "./in-memory/in-memory-repository";
import { createSqliteArticleRepository } from "./sqlite/sqlite-repository";

const createArticleRepo = async (type: StoreType) => {
  if (type === StoreType.InMemory) {
    return createInMemoryArticleRepository();
  } else {
    return createSqliteArticleRepository(':memory:');
  }
}

describe('article-stores', () => {
  describe.each([StoreType.InMemory, StoreType.Sqlite])('Test article store backed by %s', (store) => {
    it('stores article', async () => {
      const articleStore = await createArticleRepo(store);
      const stored = await articleStore.storeArticle({
        doi: 'test/article.1',
        xml: '<article></article>',
        html: '<article></article>',
        json: '{"title":"Test Article 1", "datePublished":{"value": "2008-01-03"}}',
      });

      expect(stored).toStrictEqual(true);
    });

    it('stores article content and retrieves a specific processed article by ID', async () => {
      const articleStore = await createArticleRepo(store);
      const exampleArticle = {
        doi: 'test/article.2',
        xml: '<article><article-title>Test article 2</article-title></article>',
        html: '<article><h1 itemprop="headline">Test article 2</h1></article>',
        json: '{"title":"Test Article 2", "datePublished":{"value": "2008-02-03"}}',
      };
      const result = await articleStore.storeArticle(exampleArticle);
      expect(result).toStrictEqual(true);

      const article = await articleStore.getArticle('test/article.2');

      expect(article).toBeDefined();
      expect(article.doi).toStrictEqual('test/article.2');
      expect(article.title).toStrictEqual('Test Article 2');
      expect(article.date).toStrictEqual(new Date('2008-02-03'));
      expect(article.xml).toStrictEqual('<article><article-title>Test article 2</article-title></article>');
      expect(article.html).toStrictEqual('<article><h1 itemprop="headline">Test article 2</h1></article>');
      expect(article.json).toStrictEqual('{"title":"Test Article 2", "datePublished":{"value": "2008-02-03"}}');
    });

    it('errors when retrieving unknown article', async () => {
      const articleStore = await createArticleRepo(store);
      await expect(articleStore.getArticle('test/article.3')).rejects.toThrowError();
    });

    it('gets articles summaries', async () => {
      const articleStore = await createArticleRepo(store);
      const exampleArticle1 = {
        doi: 'test/article.4',
        xml: '<article><article-title>Test article 4</article-title></article>',
        html: '<article><h1 itemprop="headline">Test article 4</h1></article>',
        json: '{"title":"Test Article 4", "datePublished":{"value": "2008-04-03"}}',
      };
      const exampleArticle2 = {
        doi: 'test/article.5',
        xml: '<article><article-title>Test article 5</article-title></article>',
        html: '<article><h1 itemprop="headline">Test article 5</h1></article>',
        json: '{"title":"Test Article 5", "datePublished":{"value": "2008-05-03"}}',
      };
      const exampleArticle3 = {
        doi: 'test/article.6',
        xml: '<article><article-title>Test article 6</article-title></article>',
        html: '<article><h1 itemprop="headline">Test article 6</h1></article>',
        json: '{"title":"Test Article 6", "datePublished":{"value": "2008-06-03"}}',
      };
      await articleStore.storeArticle(exampleArticle1);
      await articleStore.storeArticle(exampleArticle2);
      await articleStore.storeArticle(exampleArticle3);

      const articleSummaries = await articleStore.getArticleSummaries();

      expect(articleSummaries).toStrictEqual(expect.arrayContaining([{
        doi: 'test/article.4',
        title: 'Test Article 4',
        date: new Date('2008-04-03'),
      }, {
        doi: 'test/article.5',
        title: 'Test Article 5',
        date: new Date('2008-05-03'),
      }, {
        doi: 'test/article.6',
        title: 'Test Article 6',
        date: new Date('2008-06-03'),
      }]))
    });
  });
})




