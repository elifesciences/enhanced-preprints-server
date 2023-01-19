import { createArticleRepository, StoreType } from './create-article-repository';
import { Reference } from './model';

const createArticleRepo = async (type: StoreType) => {
  if (type === StoreType.InMemory) {
    return createArticleRepository(StoreType.InMemory);
  }
  throw Error('Article store not supported on test suite');
};

const exampleAuthors = [
  {
    type: 'Person',
    affiliations: [
      {
        type: 'Organization',
        address: {
          type: 'PostalAddress',
          addressCountry: 'Belgium',
        },
        name: 'GIGA-Cyclotron Research Centre-In Vivo Imaging, University of Liège',
      },
    ],
    familyNames: [
      'Van',
      'Egroo',
    ],
    givenNames: [
      'Maxime',
    ],
  },
];

const exampleReference: Reference = {
  id: 'test-ref',
  type: 'Article',
  authors: [
    {
      familyNames: [
        'Van',
        'Egroo',
      ],
      givenNames: [
        'Maxime',
      ],
    },
  ],
  datePublished: new Date('2022-06-04'),
  pageStart: 1,
  pageEnd: 2,
  title: 'Another article',
  url: 'https://bbc.co.uk',
};

const exampleLicenses = [
  {
    type: 'CreativeWork',
    url: 'http://creativecommons.org/licenses/by/4.0/',
  },
];

describe('article-stores', () => {
  describe.each([StoreType.InMemory])('Test article store backed by %s', (store) => {
    it('stores article', async () => {
      const articleStore = await createArticleRepo(store);
      const stored = await articleStore.storeArticle({
        doi: 'test/article.1',
        title: 'Test Article 1',
        abstract: 'Test article 1 abstract',
        authors: exampleAuthors,
        date: new Date('2008-01-03'),
        content: [],
        licenses: exampleLicenses,
        headings: [],
        references: [exampleReference],
      });

      expect(stored).toStrictEqual(true);
    });

    it('fails to store article if already stored', async () => {
      const articleStore = await createArticleRepo(store);
      const article = {
        doi: 'test/article.1',
        title: 'Test Article 1',
        abstract: 'Test article 1 abstract',
        authors: exampleAuthors,
        date: new Date('2008-01-03'),
        content: '<article></article>',
        licenses: exampleLicenses,
        headings: [],
        references: [exampleReference],
      };
      await articleStore.storeArticle(article);
      const stored = await articleStore.storeArticle(article);

      expect(stored).toStrictEqual(false);
    });

    it('stores article content and retrieves a specific processed article by ID', async () => {
      const articleStore = await createArticleRepo(store);

      const exampleArticle = {
        doi: 'test/article.2',
        title: 'Test Article 2',
        abstract: 'Test article 2 abstract',
        date: new Date('2008-02-03'),
        authors: exampleAuthors,
        content: [],
        licenses: exampleLicenses,
        headings: [],
        references: [exampleReference],
      };
      const result = await articleStore.storeArticle(exampleArticle);
      expect(result).toStrictEqual(true);

      const article = await articleStore.getArticle('test/article.2');

      expect(article).toBeDefined();
      expect(article.doi).toStrictEqual('test/article.2');
      expect(article.title).toStrictEqual('Test Article 2');
      expect(article.abstract).toStrictEqual('Test article 2 abstract');
      expect(article.date).toStrictEqual(new Date('2008-02-03'));
      expect(article.authors).toStrictEqual(exampleAuthors);
      expect(article.licenses).toStrictEqual(exampleLicenses);
      expect(article.content).toStrictEqual([]);
    });

    it('errors when retrieving unknown article', async () => {
      const articleStore = await createArticleRepo(store);
      await expect(articleStore.getArticle('test/article.3')).rejects.toThrowError();
    });

    it('gets articles summaries', async () => {
      const articleStore = await createArticleRepo(store);
      const exampleArticle1 = {
        doi: 'test/article.4',
        title: 'Test Article 4',
        abstract: 'Test article 4 abstract',
        date: new Date('2008-04-03'),
        authors: exampleAuthors,
        content: '<article></article>',
        licenses: exampleLicenses,
        headings: [],
        references: [exampleReference],
      };
      const exampleArticle2 = {
        doi: 'test/article.5',
        title: 'Test Article 5',
        abstract: 'Test article 5 abstract',
        date: new Date('2008-05-03'),
        authors: exampleAuthors,
        content: '<article></article>',
        licenses: exampleLicenses,
        headings: [],
        references: [exampleReference],
      };
      const exampleArticle3 = {
        doi: 'test/article.6',
        title: 'Test Article 6',
        abstract: 'Test article 6 abstract',
        date: new Date('2008-06-03'),
        authors: exampleAuthors,
        content: '<article></article>',
        licenses: exampleLicenses,
        headings: [],
        references: [exampleReference],
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
      }]));
    });

    it('throws an error with unknown identifier', async () => {
      const articleStore = await createArticleRepo(store);
      expect(async () => articleStore.getArticleVersion('not-an-id')).rejects.toThrow();
    });

    it('stores and retrieves a Versioned Article by id', async () => {
      const articleStore = await createArticleRepo(store);
      const inputArticle = {
        id: 'testid',
        versionIdentifier: '1',
        msid: 'testmsid',
        preprintDoi: 'preprint/testdoi',
        preprintUrl: 'http://preprints.org/preprint/testdoi',
        preprintPosted: new Date('2008-06-03'),
        doi: 'test/article.7',
        title: 'Test Article 7',
        abstract: 'Test article 7 abstract',
        date: new Date('2008-07-03'),
        authors: exampleAuthors,
        content: '<article></article>',
        licenses: exampleLicenses,
        headings: [],
        references: [exampleReference],
      };
      const result = await articleStore.storeVersionedArticle(inputArticle);
      const article = await articleStore.getArticleVersion('testid');

      expect(result).toStrictEqual(true);
      expect(article).toMatchObject({
        current: inputArticle,
        versions: {
          testid: inputArticle,
        },
      });
    });

    it('stores and retrieves a Versioned Article by msid', async () => {
      const articleStore = await createArticleRepo(store);
      const inputArticle = {
        id: 'testid2',
        versionIdentifier: '1',
        msid: 'testmsid',
        preprintDoi: 'preprint/testdoi2',
        preprintUrl: 'http://preprints.org/preprint/testdoi2',
        preprintPosted: new Date('2008-06-03'),
        doi: 'test/article.7',
        title: 'Test Article 7',
        abstract: 'Test article 7 abstract',
        date: new Date('2008-07-03'),
        authors: exampleAuthors,
        content: '<article></article>',
        licenses: exampleLicenses,
        headings: [],
        references: [exampleReference],
      };
      const result = await articleStore.storeVersionedArticle(inputArticle);
      const article = await articleStore.getArticleVersion('testmsid');

      expect(result).toStrictEqual(true);
      expect(article).toMatchObject({
        current: inputArticle,
        versions: {
          testid2: inputArticle,
        },
      });
    });

    it('stores two Versioned Articles with the same msid and retreives them by id', async () => {
      const articleStore = await createArticleRepo(store);
      const inputArticle1 = {
        id: 'testid3',
        versionIdentifier: '1',
        msid: 'testmsid',
        preprintDoi: 'preprint/testdoi3',
        preprintUrl: 'http://preprints.org/preprint/testdoi3',
        preprintPosted: new Date('2008-06-03'),
        doi: 'test/article.8',
        title: 'Test Article 8',
        abstract: 'Test article 8 abstract',
        date: new Date('2008-07-03'),
        authors: exampleAuthors,
        content: '<article></article>',
        licenses: exampleLicenses,
        headings: [],
        references: [exampleReference],
      };
      const inputArticle2 = {
        ...inputArticle1,
        id: 'testid4',
        versionIdentifier: '2',
        preprintDoi: 'preprint/testdoi4',
        preprintUrl: 'http://preprints.org/preprint/testdoi4',
        preprintPosted: new Date('2008-07-03'),
      };
      const result1 = await articleStore.storeVersionedArticle(inputArticle1);
      const result2 = await articleStore.storeVersionedArticle(inputArticle2);
      const article = await articleStore.getArticleVersion('testid3');

      expect(result1).toStrictEqual(true);
      expect(result2).toStrictEqual(true);
      expect(article).toMatchObject({
        current: inputArticle1,
        versions: {
          testid3: inputArticle1,
          testid4: inputArticle2,
        },
      });
    });

    it('stores two Versioned Articles with the same msid and retreives the latest by msid', async () => {
      const articleStore = await createArticleRepo(store);
      const inputArticle1 = {
        id: 'testid3',
        versionIdentifier: '1',
        msid: 'testmsid',
        preprintDoi: 'preprint/testdoi3',
        preprintUrl: 'http://preprints.org/preprint/testdoi3',
        preprintPosted: new Date('2008-06-03'),
        doi: 'test/article.8',
        title: 'Test Article 8',
        abstract: 'Test article 8 abstract',
        date: new Date('2008-07-03'),
        authors: exampleAuthors,
        content: '<article></article>',
        licenses: exampleLicenses,
        headings: [],
        references: [exampleReference],
      };
      const inputArticle2 = {
        ...inputArticle1,
        id: 'testid4',
        versionIdentifier: '2',
        preprintDoi: 'preprint/testdoi4',
        preprintUrl: 'http://preprints.org/preprint/testdoi4',
        preprintPosted: new Date('2008-07-03'),
      };
      const result1 = await articleStore.storeVersionedArticle(inputArticle1);
      const result2 = await articleStore.storeVersionedArticle(inputArticle2);
      const article = await articleStore.getArticleVersion('testmsid');

      expect(result1).toStrictEqual(true);
      expect(result2).toStrictEqual(true);
      expect(article).toMatchObject({
        current: inputArticle2,
        versions: {
          testid3: inputArticle1,
          testid4: inputArticle2,
        },
      });
    });
  });
});
