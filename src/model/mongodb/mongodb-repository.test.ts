import { MongoClient } from 'mongodb';
import {
  Reference, EnhancedArticle, License, EnhancedArticleWithVersions, ArticleRepository,
} from '../model';
import { createMongoDBArticleRepositoryFromMongoClient } from './mongodb-repository';

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

const exampleLicenses: License[] = [
  {
    type: 'CreativeWork',
    url: 'http://creativecommons.org/licenses/by/4.0/',
  },
  {
    type: 'CreativeWork',
    content: [
      {
        type: 'Paragraph',
        content: [
          'The copyright holder for this pre-print is the author. All rights reserved. The material may not be redistributed, re-used or adapted without the author\'s permission.',
        ],
      },
    ],
  },
];

describe('article-stores', () => {
  let articleStore: ArticleRepository;
  let connection: MongoClient | null;
  beforeEach(async () => {
    if (process.env.MONGO_URL === undefined) {
      throw Error('Cannot connect to jest-mongodb');
    }
    connection = await MongoClient.connect(process.env.MONGO_URL);
    await connection.db('epp').collection('articles').deleteMany({});
    await connection.db('epp').collection('versioned_articles').deleteMany({});
    articleStore = await createMongoDBArticleRepositoryFromMongoClient(connection);
  });

  afterEach(async () => {
    if (connection) {
      connection.close();
      connection = null;
    }
  });

  it('returns null with unknown identifier', async () => {
    expect(await articleStore.findArticleVersion('not-an-id')).toBeNull();
  });

  it('stores and retrieves a Versioned Article by id with all fields', async () => {
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
        references: [exampleReference],
      },
      license: 'https://creativecommons.org/licenses/by/4.0/',
    };
    const result = await articleStore.storeEnhancedArticle(inputArticle);
    const article = await articleStore.findArticleVersion('testid1');

    expect(result).toStrictEqual(true);
    expect(article).toMatchObject({
      article: inputArticle,
      versions: {
        'testid1.1': {
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
          license: 'https://creativecommons.org/licenses/by/4.0/',
        },
      },
    });
  });

  it('stores and retrieves a Versioned Article by msid', async () => {
    const inputArticle = {
      id: 'testid2.2',
      msid: 'testid2',
      doi: 'journal/testid2.2',
      versionIdentifier: '1',
      versionDoi: 'journal/testid2.2',
      preprintDoi: 'preprint/article8',
      preprintUrl: 'http://preprints.org/preprint/article8',
      preprintPosted: new Date('2008-08-02'),
      published: new Date('2008-09-02'),
      article: {
        title: 'Test Article 8',
        abstract: 'Test article 8 abstract',
        authors: exampleAuthors,
        content: '<article></article>',
        licenses: exampleLicenses,
        references: [exampleReference],
      },
    };
    const result = await articleStore.storeEnhancedArticle(inputArticle);
    const article = await articleStore.findArticleVersion('testid2');

    expect(result).toStrictEqual(true);
    expect(article).toMatchObject({
      article: inputArticle,
      versions: {
        'testid2.2': {
          id: 'testid2.2',
          msid: 'testid2',
          doi: 'journal/testid2.2',
          versionIdentifier: '1',
          versionDoi: 'journal/testid2.2',
          preprintDoi: 'preprint/article8',
          preprintUrl: 'http://preprints.org/preprint/article8',
          preprintPosted: new Date('2008-08-02'),
          published: new Date('2008-09-02'),
        },
      },
    });
  });

  it('stores two Versioned Articles with the same msid and retreives them by id', async () => {
    const inputArticle1 = {
      id: 'testid3.1',
      msid: 'testid3',
      doi: 'journal/testid3.1',
      versionIdentifier: '1',
      versionDoi: 'journal/testid3.1',
      preprintDoi: 'preprint/article9',
      preprintUrl: 'http://preprints.org/preprint/article9',
      preprintPosted: new Date('2008-09-01'),
      published: new Date('2008-10-01'),
      article: {
        title: 'Test Article 9',
        abstract: 'Test article 9 abstract',
        authors: exampleAuthors,
        content: '<article></article>',
        licenses: exampleLicenses,
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
      published: new Date('2008-10-02'),
      article: {
        title: 'Test Article 9',
        abstract: 'Test article 9 abstract',
        authors: exampleAuthors,
        content: '<article></article>',
        licenses: exampleLicenses,
        references: [exampleReference],
      },
    };
    const result1 = await articleStore.storeEnhancedArticle(inputArticle1);
    const result2 = await articleStore.storeEnhancedArticle(inputArticle2);
    const article = await articleStore.findArticleVersion('testid3.1');

    expect(result1).toStrictEqual(true);
    expect(result2).toStrictEqual(true);
    expect(article).toMatchObject<EnhancedArticleWithVersions>({
      article: inputArticle1,
      versions: {
        'testid3.1': {
          id: 'testid3.1',
          msid: 'testid3',
          doi: 'journal/testid3.1',
          versionIdentifier: '1',
          versionDoi: 'journal/testid3.1',
          preprintDoi: 'preprint/article9',
          preprintUrl: 'http://preprints.org/preprint/article9',
          preprintPosted: new Date('2008-09-01'),
          published: new Date('2008-10-01'),
        },
        'testid3.2': {
          id: 'testid3.2',
          msid: 'testid3',
          doi: 'journal/testid3.2',
          versionIdentifier: '1',
          versionDoi: 'journal/testid3.2',
          preprintDoi: 'preprint/article9v2',
          preprintUrl: 'http://preprints.org/preprint/article9v2',
          preprintPosted: new Date('2008-09-02'),
          published: new Date('2008-10-02'),
        },
      },
    });
  });

  it('stores two Versioned Articles with the same msid and retreives the latest by msid', async () => {
    const inputArticle1 = {
      id: 'testid4.1',
      msid: 'testid4',
      doi: 'journal/testid4.1',
      versionIdentifier: '1',
      versionDoi: 'journal/testid4.1',
      preprintDoi: 'preprint/article10',
      preprintUrl: 'http://preprints.org/preprint/article10',
      preprintPosted: new Date('2008-10-01'),
      published: new Date('2008-11-01'),
      article: {
        title: 'Test Article 10',
        abstract: 'Test article 10 abstract',
        authors: exampleAuthors,
        content: '<article></article>',
        licenses: exampleLicenses,
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
      published: new Date('2008-11-02'),
      article: {
        title: 'Test Article 10',
        abstract: 'Test article 10 abstract',
        authors: exampleAuthors,
        content: '<article></article>',
        licenses: exampleLicenses,
        references: [exampleReference],
      },
    };
    const result1 = await articleStore.storeEnhancedArticle(inputArticle1);
    const result2 = await articleStore.storeEnhancedArticle(inputArticle2);
    const article = await articleStore.findArticleVersion('testid4');

    expect(result1).toStrictEqual(true);
    expect(result2).toStrictEqual(true);
    expect(article).toMatchObject<EnhancedArticleWithVersions>({
      article: inputArticle2,
      versions: {
        'testid4.1': {
          id: 'testid4.1',
          msid: 'testid4',
          doi: 'journal/testid4.1',
          versionIdentifier: '1',
          versionDoi: 'journal/testid4.1',
          preprintDoi: 'preprint/article10',
          preprintUrl: 'http://preprints.org/preprint/article10',
          preprintPosted: new Date('2008-10-01'),
          published: new Date('2008-11-01'),
        },
        'testid4.2': {
          id: 'testid4.2',
          msid: 'testid4',
          doi: 'journal/testid4.2',
          versionIdentifier: '1',
          versionDoi: 'journal/testid4.2',
          preprintDoi: 'preprint/article10v2',
          preprintUrl: 'http://preprints.org/preprint/article10v2',
          preprintPosted: new Date('2008-10-02'),
          published: new Date('2008-11-02'),
        },
      },
    });
  });

  it('stores two Versioned Articles and retrieves summaries', async () => {
    const inputArticle1 = {
      id: 'testid3.1',
      msid: 'testid3',
      doi: 'journal/testid3.1',
      versionIdentifier: '1',
      versionDoi: 'journal/testid3.1',
      preprintDoi: 'preprint/article9',
      preprintUrl: 'http://preprints.org/preprint/article9',
      preprintPosted: new Date('2008-09-01'),
      published: new Date('2008-10-01'),
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
      published: new Date('2008-10-02'),
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
    const articles = await articleStore.getEnhancedArticleSummaries();

    expect(result1).toStrictEqual(true);
    expect(result2).toStrictEqual(true);
    expect(articles).toMatchObject([
      {
        id: 'testid3.1',
        msid: 'testid3',
        doi: 'journal/testid3.1',
        title: 'Test Article 9',
        date: new Date('2008-10-01'),
      },
      {
        id: 'testid3.2',
        msid: 'testid3',
        doi: 'journal/testid3.2',
        title: 'Test Article 9',
        date: new Date('2008-10-02'),
      },
    ]);
  });

  it('stores a Versioned Article and deletes successfully', async () => {
    const inputArticle1 = {
      id: 'testid3.1',
      msid: 'testid3',
      doi: 'journal/testid3.1',
      versionIdentifier: '1',
      versionDoi: 'journal/testid3.1',
      preprintDoi: 'preprint/article9',
      preprintUrl: 'http://preprints.org/preprint/article9',
      preprintPosted: new Date('2008-09-01'),
      published: new Date('2008-10-01'),
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

    await articleStore.storeEnhancedArticle(inputArticle1);
    const result = await articleStore.deleteArticleVersion(inputArticle1.id);

    expect(result).toStrictEqual(true);
  });

  it('does not retrieve non-published articles by default', async () => {
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
      published: null,
      article: {
        title: 'Test Article 7',
        abstract: 'Test article 7 abstract',
        authors: exampleAuthors,
        content: '<article></article>',
        licenses: exampleLicenses,
        references: [exampleReference],
      },
      license: 'https://creativecommons.org/licenses/by/4.0/',
    };
    const result = await articleStore.storeEnhancedArticle(inputArticle);
    const article = await articleStore.findArticleVersion('testid1');

    expect(result).toStrictEqual(true);
    expect(article).toBeNull();
  });

  it('does not retrieve future-published articles by default', async () => {
    const published = new Date();
    published.setDate(new Date().getDate() + 1); // published tomorrow
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
      published,
      article: {
        title: 'Test Article 7',
        abstract: 'Test article 7 abstract',
        authors: exampleAuthors,
        content: '<article></article>',
        licenses: exampleLicenses,
        references: [exampleReference],
      },
      license: 'https://creativecommons.org/licenses/by/4.0/',
    };
    const result = await articleStore.storeEnhancedArticle(inputArticle);
    const article = await articleStore.findArticleVersion('testid1');

    expect(result).toStrictEqual(true);
    expect(article).toBeNull();
  });

  it('will retrieve non-published and future published articles when asked', async () => {
    const published = new Date();
    published.setDate(new Date().getDate() + 1); // published tomorrow
    const inputArticle1: EnhancedArticle = {
      id: 'testid1.1',
      msid: 'testid1',
      doi: 'journal/testid1',
      versionIdentifier: '1',
      versionDoi: 'journal/testid1.1',
      preprintDoi: 'preprint/article7',
      preprintUrl: 'http://preprints.org/preprint/article7',
      preprintPosted: new Date('2008-07-01'),
      sentForReview: new Date('2008-07-02'),
      published,
      article: {
        title: 'Test Article 7',
        abstract: 'Test article 7 abstract',
        authors: exampleAuthors,
        content: '<article></article>',
        licenses: exampleLicenses,
        references: [exampleReference],
      },
      license: 'https://creativecommons.org/licenses/by/4.0/',
    };
    const inputArticle2: EnhancedArticle = {
      id: 'testid1.2',
      msid: 'testid1',
      doi: 'journal/testid1',
      versionIdentifier: '1',
      versionDoi: 'journal/testid1.2',
      preprintDoi: 'preprint/article7',
      preprintUrl: 'http://preprints.org/preprint/article7',
      preprintPosted: new Date('2008-07-01'),
      sentForReview: new Date('2008-07-02'),
      published: null,
      article: {
        title: 'Test Article 7',
        abstract: 'Test article 7 abstract',
        authors: exampleAuthors,
        content: '<article></article>',
        licenses: exampleLicenses,
        references: [exampleReference],
      },
      license: 'https://creativecommons.org/licenses/by/4.0/',
    };
    const result1 = await articleStore.storeEnhancedArticle(inputArticle1);
    const result2 = await articleStore.storeEnhancedArticle(inputArticle2);
    const articleWithoutPreviews = await articleStore.findArticleVersion('testid1', false);
    const articleWithPreviews = await articleStore.findArticleVersion('testid1', true);

    expect(result1).toStrictEqual(true);
    expect(result2).toStrictEqual(true);
    expect(articleWithoutPreviews).toBeNull();
    expect(articleWithPreviews).toMatchObject({
      article: inputArticle1,
      versions: {
        'testid1.2': {
          id: 'testid1.2',
          msid: 'testid1',
          doi: 'journal/testid1',
          versionIdentifier: '1',
          versionDoi: 'journal/testid1.2',
          preprintDoi: 'preprint/article7',
          preprintUrl: 'http://preprints.org/preprint/article7',
          preprintPosted: new Date('2008-07-01'),
          sentForReview: new Date('2008-07-02'),
          license: 'https://creativecommons.org/licenses/by/4.0/',
        },
        'testid1.1': {
          id: 'testid1.1',
          msid: 'testid1',
          doi: 'journal/testid1',
          versionIdentifier: '1',
          versionDoi: 'journal/testid1.1',
          preprintDoi: 'preprint/article7',
          preprintUrl: 'http://preprints.org/preprint/article7',
          preprintPosted: new Date('2008-07-01'),
          sentForReview: new Date('2008-07-02'),
          published,
          license: 'https://creativecommons.org/licenses/by/4.0/',
        },
      },
    });
  });
});
