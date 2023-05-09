import { createArticleRepository, StoreType } from './create-article-repository';
import { Reference, EnhancedArticle } from './model';

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
        date: new Date('2008-01-01'),
        content: [],
        licenses: exampleLicenses,
        headings: [],
        references: [exampleReference],
      }, 'test/article.1');

      expect(stored).toStrictEqual(true);
    });

    it('overrides the article if already stored', async () => {
      const articleStore = await createArticleRepo(store);
      const article = {
        doi: 'test/article.1',
        title: 'Test Article 1',
        abstract: 'Test article 1 abstract',
        authors: exampleAuthors,
        date: new Date('2008-01-01'),
        content: '<article></article>',
        licenses: exampleLicenses,
        headings: [],
        references: [exampleReference],
      };
      const stored1 = await articleStore.storeArticle(article, 'test/article.1');
      const retreived1 = await articleStore.getArticle('test/article.1');

      const stored2 = await articleStore.storeArticle({
        ...article,
        content: '<article>content</article>',
      }, 'test/article.1');

      const retreived2 = await articleStore.getArticle(article.doi);

      expect(stored1).toStrictEqual(true);
      expect(stored2).toStrictEqual(true);

      expect(retreived1.content).toStrictEqual('<article></article>');
      expect(retreived2.content).toStrictEqual('<article>content</article>');
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
      const result = await articleStore.storeArticle(exampleArticle, 'test/article.2');
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

    it('stores article content and retrieves a specific processed article by ID, different to DOI', async () => {
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
      const result = await articleStore.storeArticle(exampleArticle, 'test/article.2/v1');
      expect(result).toStrictEqual(true);

      const article = await articleStore.getArticle('test/article.2/v1');
      expect(article).toBeDefined();
      expect(article.doi).toStrictEqual('test/article.2');

      expect(articleStore.getArticle('test/article.2')).rejects.toThrowError();
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
        date: new Date('2008-04-01'),
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
        date: new Date('2008-05-01'),
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
        date: new Date('2008-06-01'),
        authors: exampleAuthors,
        content: '<article></article>',
        licenses: exampleLicenses,
        headings: [],
        references: [exampleReference],
      };
      await articleStore.storeArticle(exampleArticle1, 'test/article.4');
      await articleStore.storeArticle(exampleArticle2, 'test/article.5');
      await articleStore.storeArticle(exampleArticle3, 'test/article.6');

      const articleSummaries = await articleStore.getArticleSummaries();

      expect(articleSummaries).toStrictEqual(expect.arrayContaining([{
        id: 'test/article.4',
        doi: 'test/article.4',
        title: 'Test Article 4',
        date: new Date('2008-04-01'),
      }, {
        id: 'test/article.5',
        doi: 'test/article.5',
        title: 'Test Article 5',
        date: new Date('2008-05-01'),
      }, {
        id: 'test/article.6',
        doi: 'test/article.6',
        title: 'Test Article 6',
        date: new Date('2008-06-01'),
      }]));
    });

    it('gets articles hashes', async () => {
      const articleStore = await createArticleRepo(store);
      const exampleArticle1 = {
        doi: 'test/article.4',
        hash: '6a096ec816505f5d70c3d0e7be791bc0',
        title: 'Test Article 4',
        abstract: 'Test article 4 abstract',
        date: new Date('2008-04-01'),
        authors: exampleAuthors,
        content: '<article></article>',
        licenses: exampleLicenses,
        headings: [],
        references: [exampleReference],
      };
      const exampleArticle2 = {
        doi: 'test/article.5',
        hash: '4cfcf2fe178c18ba43a61e9ad415ad3c',
        title: 'Test Article 5',
        abstract: 'Test article 5 abstract',
        date: new Date('2008-05-01'),
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
        date: new Date('2008-06-01'),
        authors: exampleAuthors,
        content: '<article></article>',
        licenses: exampleLicenses,
        headings: [],
        references: [exampleReference],
      };
      await articleStore.storeArticle(exampleArticle1, 'test/article.4');
      await articleStore.storeArticle(exampleArticle2, 'test/article.5');
      await articleStore.storeArticle(exampleArticle3, 'test/article.6');

      const articleSummaries = await articleStore.getArticleHashes();

      expect(articleSummaries).toStrictEqual(expect.arrayContaining([{
        id: 'test/article.4',
        hash: '6a096ec816505f5d70c3d0e7be791bc0',
      }, {
        id: 'test/article.5',
        hash: '4cfcf2fe178c18ba43a61e9ad415ad3c',
      }, {
        id: 'test/article.6',
        hash: undefined,
      }]));
    });

    it('throws an error with unknown identifier', async () => {
      const articleStore = await createArticleRepo(store);
      expect(async () => articleStore.getArticleVersion('not-an-id')).rejects.toThrow();
    });

    it('stores and retrieves a Versioned Article by id with all fields', async () => {
      const articleStore = await createArticleRepo(store);
      const inputArticle: EnhancedArticle = {
        id: 'testid1.1',
        msid: 'testid1',
        doi: 'journal/testid1',
        versionIdentifier: '1',
        versionDoi: 'journal/testid1.1',
        preprintDoi: 'preprint/article7',
        preprintUrl: 'http://preprints.org/preprint/article7',
        preprintPosted: new Date('2008-07-01'),
        sentForReview: new Date('2008-07-02'),
        published: new Date('2008-11-02'),
        article: {
          title: 'Test Article 7',
          abstract: 'Test article 7 abstract',
          authors: exampleAuthors,
          content: '<article></article>',
          licenses: exampleLicenses,
          headings: [],
          references: [exampleReference],
        },
      };
      const result = await articleStore.storeEnhancedArticle(inputArticle);
      const article = await articleStore.getArticleVersion('testid1');

      expect(result).toStrictEqual(true);
      expect(article).toMatchObject({
        article: inputArticle,
        versions: {
          'testid1.1': inputArticle,
        },
      });
    });

    it('stores and retrieves a Versioned Article by msid', async () => {
      const articleStore = await createArticleRepo(store);
      const inputArticle = {
        id: 'testid2.2',
        msid: 'testid2',
        doi: 'journal/testid2.2',
        versionIdentifier: '1',
        versionDoi: 'journal/testid2.2',
        preprintDoi: 'preprint/article8',
        preprintUrl: 'http://preprints.org/preprint/article8',
        preprintPosted: new Date('2008-08-02'),
        article: {
          title: 'Test Article 8',
          abstract: 'Test article 8 abstract',
          authors: exampleAuthors,
          content: '<article></article>',
          licenses: exampleLicenses,
          headings: [],
          references: [exampleReference],
        },
      };
      const result = await articleStore.storeEnhancedArticle(inputArticle);
      const article = await articleStore.getArticleVersion('testid2');

      expect(result).toStrictEqual(true);
      expect(article).toMatchObject({
        article: inputArticle,
        versions: {
          'testid2.2': inputArticle,
        },
      });
    });

    it('stores two Versioned Articles with the same msid and retreives them by id', async () => {
      const articleStore = await createArticleRepo(store);
      const inputArticle1 = {
        id: 'testid3.1',
        msid: 'testid3',
        doi: 'journal/testid3.1',
        versionIdentifier: '1',
        versionDoi: 'journal/testid3.1',
        preprintDoi: 'preprint/article9',
        preprintUrl: 'http://preprints.org/preprint/article9',
        preprintPosted: new Date('2008-09-01'),
        article: {
          title: 'Test Article 9',
          abstract: 'Test article 9 abstract',
          authors: exampleAuthors,
          content: '<article></article>',
          licenses: exampleLicenses,
          headings: [],
          references: [exampleReference],
        },
      };
      const inputArticle2 = {
        id: 'testid3.2',
        msid: 'testid3',
        doi: 'journal/testid3.2',
        versionIdentifier: '1',
        versionDoi: 'journal/testid3.2',
        preprintDoi: 'preprint/article9v2',
        preprintUrl: 'http://preprints.org/preprint/article9v2',
        preprintPosted: new Date('2008-09-02'),
        article: {
          title: 'Test Article 9',
          abstract: 'Test article 9 abstract',
          authors: exampleAuthors,
          content: '<article></article>',
          licenses: exampleLicenses,
          headings: [],
          references: [exampleReference],
        },
      };
      const result1 = await articleStore.storeEnhancedArticle(inputArticle1);
      const result2 = await articleStore.storeEnhancedArticle(inputArticle2);
      const article = await articleStore.getArticleVersion('testid3.1');

      expect(result1).toStrictEqual(true);
      expect(result2).toStrictEqual(true);
      expect(article).toMatchObject({
        article: inputArticle1,
        versions: {
          'testid3.1': inputArticle1,
          'testid3.2': inputArticle2,
        },
      });
    });

    it('stores two Versioned Articles with the same msid and retreives the latest by msid', async () => {
      const articleStore = await createArticleRepo(store);
      const inputArticle1 = {
        id: 'testid4.1',
        msid: 'testid4',
        doi: 'journal/testid4.1',
        versionIdentifier: '1',
        versionDoi: 'journal/testid4.1',
        preprintDoi: 'preprint/article10',
        preprintUrl: 'http://preprints.org/preprint/article10',
        preprintPosted: new Date('2008-10-01'),
        article: {
          title: 'Test Article 10',
          abstract: 'Test article 10 abstract',
          authors: exampleAuthors,
          content: '<article></article>',
          licenses: exampleLicenses,
          headings: [],
          references: [exampleReference],
        },
      };
      const inputArticle2 = {
        id: 'testid4.2',
        msid: 'testid4',
        doi: 'journal/testid4.2',
        versionIdentifier: '1',
        versionDoi: 'journal/testid4.2',
        preprintDoi: 'preprint/article10v2',
        preprintUrl: 'http://preprints.org/preprint/article10v2',
        preprintPosted: new Date('2008-10-02'),
        article: {
          title: 'Test Article 10',
          abstract: 'Test article 10 abstract',
          authors: exampleAuthors,
          content: '<article></article>',
          licenses: exampleLicenses,
          headings: [],
          references: [exampleReference],
        },
      };
      const result1 = await articleStore.storeEnhancedArticle(inputArticle1);
      const result2 = await articleStore.storeEnhancedArticle(inputArticle2);
      const article = await articleStore.getArticleVersion('testid4');

      expect(result1).toStrictEqual(true);
      expect(result2).toStrictEqual(true);
      expect(article).toMatchObject({
        article: inputArticle2,
        versions: {
          'testid4.1': inputArticle1,
          'testid4.2': inputArticle2,
        },
      });
    });
  });
});
