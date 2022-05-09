import { createInMemoryArticleRepository } from './article-repository';

describe('in-memory-article-store', () => {
  it('stores article', async () => {
    const inMemoryArticleStore = await createInMemoryArticleRepository();
    const stored = await inMemoryArticleStore.storeArticle({
      doi: 'test/article.1',
      title: 'Test Article 1',
      date: new Date('2008-01-03'),
      xml: '<article></article>',
      html: '<article></article>',
      json: '{}',
    });

    expect(stored).toStrictEqual(true);
  });

  it('stores and retrieves a specific article by ID', async () => {
    const inMemoryArticleStore = await createInMemoryArticleRepository();
    const exampleArticle = {
      doi: 'test/article.2',
      title: 'Test Article 2',
      date: new Date('2008-02-03'),
      xml: '<article><article-title>Test article 2</article-title></article>',
      html: '<article><h1 itemprop="headline">Test article 2</h1></article>',
      json: '{}',
    };
    inMemoryArticleStore.storeArticle(exampleArticle);

    const article = await inMemoryArticleStore.getArticle('test/article.2');

    expect(article).toBeDefined();
    expect(article.doi).toStrictEqual('test/article.2');
    expect(article.title).toStrictEqual('Test Article 2');
    expect(article.date).toStrictEqual(new Date('2008-02-03'));
    expect(article.xml).toStrictEqual('<article><article-title>Test article 2</article-title></article>');
    expect(article.html).toStrictEqual('<article><h1 itemprop="headline">Test article 2</h1></article>');
    expect(article.json).toStrictEqual('{}');
  });

  it('errors when retrieving unknown article', async () => {
    const inMemoryArticleStore = await createInMemoryArticleRepository();
    expect(async () => await inMemoryArticleStore.getArticle('test/article.3')).toThrowError();
  });

  it('gets articles summaries', async () => {
    const inMemoryArticleStore = await createInMemoryArticleRepository();
    const exampleArticle1 = {
      doi: 'test/article.4',
      title: 'Test Article 4',
      date: new Date('2008-04-03'),
      xml: '<article><article-title>Test article 4</article-title></article>',
      html: '<article><h1 itemprop="headline">Test article 4</h1></article>',
      json: '{}',
    };
    const exampleArticle2 = {
      doi: 'test/article.5',
      title: 'Test Article 5',
      date: new Date('2008-05-03'),
      xml: '<article><article-title>Test article 5</article-title></article>',
      html: '<article><h1 itemprop="headline">Test article 5</h1></article>',
      json: '{}',
    };
    const exampleArticle3 = {
      doi: 'test/article.6',
      title: 'Test Article 6',
      date: new Date('2008-06-03'),
      xml: '<article><article-title>Test article 6</article-title></article>',
      html: '<article><h1 itemprop="headline">Test article 6</h1></article>',
      json: '{}',
    };
    inMemoryArticleStore.storeArticle(exampleArticle1);
    inMemoryArticleStore.storeArticle(exampleArticle2);
    inMemoryArticleStore.storeArticle(exampleArticle3);

    const articleSummaries = await inMemoryArticleStore.getArticleSummaries();

    expect(articleSummaries).toContainEqual({
      doi: 'test/article.4',
      title: 'Test Article 4',
      date: new Date('2008-04-03'),
    });
    expect(articleSummaries).toContainEqual({
      doi: 'test/article.5',
      title: 'Test Article 5',
      date: new Date('2008-05-03'),
    });
    expect(articleSummaries).toContainEqual({
      doi: 'test/article.6',
      title: 'Test Article 6',
      date: new Date('2008-06-03'),
    })
  });
});
