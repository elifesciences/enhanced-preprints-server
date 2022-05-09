import { createInMemoryArticleStore } from './article-store';

describe('in-memory-article-store', () => {
  it('stores article', async () => {
    const inMemoryArticleStore = createInMemoryArticleStore();
    const stored = inMemoryArticleStore.storeArticle({
      doi: 'test/article.1',
      title: 'Test Article 1',
      date: new Date('2008-01-03'),
      xml: '<article></article>',
      html: '<article></article>',
      json: '{}',
    }, 'reviewing group 1');

    expect(stored).toStrictEqual(true);
  });

  it('stores and retrieves a specific reviewing groups by ID', async () => {
    const inMemoryArticleStore = createInMemoryArticleStore();
    const exampleArticle = {
      doi: 'test/article.2',
      title: 'Test Article 2',
      date: new Date('2008-02-03'),
      xml: '<article><article-title>Test article 2</article-title></article>',
      html: '<article><h1 itemprop="headline">Test article 2</h1></article>',
      json: '{}',
    };
    inMemoryArticleStore.storeArticle(exampleArticle, 'reviewing group 1');

    const article = inMemoryArticleStore.getArticle('test/article.2');

    expect(article).toBeDefined();
    expect(article.doi).toStrictEqual('test/article.2');
    expect(article.xml).toStrictEqual('<article><article-title>Test article 2</article-title></article>');
    expect(article.date).toStrictEqual(new Date('2008-02-03'));
    expect(article.title).toStrictEqual('Test Article 2');
    expect(article.html).toStrictEqual('<article><h1 itemprop="headline">Test article 2</h1></article>');
    expect(article.previousVersions.length).toStrictEqual(0);
    expect(article.reviewingGroupId).toStrictEqual('reviewing group 1');
  });

  it('errors when retrieving unknown article', async () => {
    const inMemoryArticleStore = createInMemoryArticleStore();
    expect(() => inMemoryArticleStore.getArticle('test/article.3')).toThrowError();
  });

  it('gets all articles by reviewing group Id', async () => {
    const inMemoryArticleStore = createInMemoryArticleStore();
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
    inMemoryArticleStore.storeArticle(exampleArticle1, 'reviewing group 1');
    inMemoryArticleStore.storeArticle(exampleArticle2, 'reviewing group 2');
    inMemoryArticleStore.storeArticle(exampleArticle3, 'reviewing group 1');

    //examples added in test cases above
    const articles1 = inMemoryArticleStore.getArticlesForReviewingGroup('reviewing group 1');
    const articles2 = inMemoryArticleStore.getArticlesForReviewingGroup('reviewing group 2');

    expect(articles1.length).toBe(2);
    expect(articles2.length).toBe(1);

    //extract DOIs
    const articleDoisFromRG1 = articles1.map((article) => article.doi);
    const articleDoisFromRG2 = articles2.map((article) => article.doi);
    expect(articleDoisFromRG1).toContain(exampleArticle1.doi);
    expect(articleDoisFromRG1).toContain(exampleArticle3.doi);
    expect(articleDoisFromRG2).toContain(exampleArticle2.doi);
  });
});
