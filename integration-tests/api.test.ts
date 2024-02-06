import request from 'supertest';
import axios from 'axios';
import { MongoClient } from 'mongodb';
import { Express } from 'express';
import { createApp } from '../src/app';
import mockBody1 from './mock-data/mock-body-1.json';
import mockBody2 from './mock-data/mock-body-2.json';
import mockBody3 from './mock-data/mock-body-3.json';
import { ArticleRepository } from '../src/model/model';
import { createMongoDBArticleRepositoryFromMongoClient } from '../src/model/mongodb/mongodb-repository';

jest.mock('axios');

describe('server tests', () => {
  let articleStore: ArticleRepository;
  let connection: MongoClient;

  beforeEach(async () => {
    if (process.env.MONGO_URL === undefined) {
      throw Error('Cannot connect to jest-mongodb');
    }
    connection = await MongoClient.connect(process.env.MONGO_URL);
    await connection.db('epp').collection('articles').deleteMany({});
    await connection.db('epp').collection('versioned_articles').deleteMany({});
    articleStore = await createMongoDBArticleRepositoryFromMongoClient(connection);
  });

  afterEach(() => {
    connection.close();
  });

  describe('/api/preprints', () => {
    it.each([mockBody1, mockBody2, mockBody3])('passes validation on import', async (mockBody) => {
      await request(createApp(articleStore))
        .post('/preprints')
        .send(mockBody)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, {
          result: true,
          message: 'OK',
        });
    });

    const enhancedArticle = {
      id: 'testid3',
      msid: 'testmsid',
      doi: 'doi1',
      volume: '1',
      eLocationId: 'RPtestid3',
      versionIdentifier: '1',
      versionDoi: 'publisher/testid1',
      article: {
        title: 'test article',
        authors: [
          {
            familyNames: ['Daffy'],
            givenNames: ['Duck'],
            affiliations: [{ name: 'ACME Labs' }],
            emails: ['daffy.duck@acme.org'],
          },
        ],
        abstract: 'This is the test abstract',
        licenses: [],
        content: 'This is some test content',
        references: [],
      },
      preprintDoi: 'preprint/testid1',
      preprintUrl: 'doi.org/preprint/testid1',
      preprintPosted: '2023-01-02T00:00:00.000Z',
      sentForReview: '2023-01-03T00:00:00.000Z',
      published: '2023-01-23T00:00:00.000Z',
      publishedYear: 2023,
      subjects: ['subject 1', 'subject 2'],
      license: 'https://creativecommons.org/licenses/by/4.0/',
    };

    const versionSummary = {
      id: 'testid3',
      msid: 'testmsid',
      doi: 'doi1',
      volume: '1',
      eLocationId: 'RPtestid3',
      versionIdentifier: '1',
      versionDoi: 'publisher/testid1',
      preprintDoi: 'preprint/testid1',
      preprintUrl: 'doi.org/preprint/testid1',
      preprintPosted: '2023-01-02T00:00:00.000Z',
      sentForReview: '2023-01-03T00:00:00.000Z',
      published: '2023-01-23T00:00:00.000Z',
      publishedYear: 2023,
      subjects: ['subject 1', 'subject 2'],
      license: 'https://creativecommons.org/licenses/by/4.0/',
    };

    it('imports a valid JSON body', async () => {
      await request(createApp(articleStore))
        .post('/preprints')
        .send(enhancedArticle)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, {
          result: true,
          message: 'OK',
        });
    });

    it('imports a valid JSON body and we are able to retrieve it', async () => {
      const app = createApp(articleStore);

      await request(app)
        .post('/preprints')
        .send(enhancedArticle)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, {
          result: true,
          message: 'OK',
        });

      await request(app)
        .get('/api/preprints/testid3')
        .expect(200, {
          article: enhancedArticle,
          versions: {
            testid3: versionSummary,
          },
        });
    });

    it('adds the pdf url when the file is found', async () => {
      const pdfUrl = 'https://github.com/elifesciences/enhanced-preprints-data/raw/master/data/testmsid/v1/testmsid-v1.pdf';
      // Needed for jest mock of axios
      // @ts-ignore
      // eslint-disable-next-line consistent-return
      axios.get.mockImplementation((url: string) => {
        if (url === pdfUrl) {
          return Promise.resolve({
            status: 200,
          });
        }
      });
      const app = createApp(articleStore);

      await request(app)
        .post('/preprints')
        .send(enhancedArticle)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, {
          result: true,
          message: 'OK',
        });

      await request(app)
        .get('/api/preprints/testid3')
        .expect(200, {
          article: {
            ...enhancedArticle,
            pdfUrl,
          },
          versions: {
            testid3: versionSummary,
          },
        });
    });

    it('imports two content types and we are able to retrieve the earliest by ID, and the latest by msid', async () => {
      const app = createApp(articleStore);

      const exampleVersion1 = {
        ...enhancedArticle,
        id: 'testid4',
        versionIdentifier: '1',
        msid: 'article.2',
      };
      const exampleVersion2 = {
        id: 'testid5',
        versionIdentifier: '2',
        msid: 'article.2',
        doi: 'test/article.2',
        preprintDoi: 'preprint/testdoi5',
        preprintUrl: 'http://preprints.org/preprint/testdoi5',
        preprintPosted: '2023-02-02T00:00:00.000Z',
        article: {
          title: 'Test Article 2',
          abstract: 'Test article 2 abstract',
          authors: [],
          content: '<article></article>',
          licenses: [],
          references: [],
        },
        published: '2023-02-03T00:00:00.000Z',
      };

      const versionSummary1 = {
        ...versionSummary,
        id: 'testid4',
        versionIdentifier: '1',
        msid: 'article.2',
      };

      const versionSummary2 = {
        id: 'testid5',
        versionIdentifier: '2',
        msid: 'article.2',
        doi: 'test/article.2',
        preprintDoi: 'preprint/testdoi5',
        preprintUrl: 'http://preprints.org/preprint/testdoi5',
        preprintPosted: '2023-02-02T00:00:00.000Z',
        published: '2023-02-03T00:00:00.000Z',
      };

      await request(app)
        .post('/preprints')
        .send(exampleVersion1)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, {
          result: true,
          message: 'OK',
        });
      await request(app)
        .post('/preprints')
        .send(exampleVersion2)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, {
          result: true,
          message: 'OK',
        });

      await request(app)
        .get('/api/preprints/testid4')
        .expect({
          article: exampleVersion1,
          versions: {
            testid4: versionSummary1,
            testid5: versionSummary2,
          },
        });
      await request(app)
        .get('/api/preprints/article.2')
        .expect({
          article: exampleVersion2,
          versions: {
            testid4: versionSummary1,
            testid5: versionSummary2,
          },
        });
    });

    it('imports non-published content, which is retrieved using query param `previews`', async () => {
      const app = createApp(articleStore);

      const exampleVersion1 = {
        ...enhancedArticle,
        id: 'testid4',
        versionIdentifier: '1',
        msid: 'article.2',
      };
      const exampleVersion2 = {
        id: 'testid5',
        versionIdentifier: '2',
        msid: 'article.2',
        doi: 'test/article.2',
        preprintDoi: 'preprint/testdoi5',
        preprintUrl: 'http://preprints.org/preprint/testdoi5',
        preprintPosted: '2023-02-02T00:00:00.000Z',
        article: {
          title: 'Test Article 2',
          abstract: 'Test article 2 abstract',
          authors: [],
          content: '<article></article>',
          licenses: [],
          references: [],
        },
        published: null,
      };

      const versionSummary1 = {
        ...versionSummary,
        id: 'testid4',
        versionIdentifier: '1',
        msid: 'article.2',
      };

      const versionSummary2 = {
        id: 'testid5',
        versionIdentifier: '2',
        msid: 'article.2',
        doi: 'test/article.2',
        preprintDoi: 'preprint/testdoi5',
        preprintUrl: 'http://preprints.org/preprint/testdoi5',
        preprintPosted: '2023-02-02T00:00:00.000Z',
        published: null,
      };

      await request(app)
        .post('/preprints')
        .send(exampleVersion1)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, {
          result: true,
          message: 'OK',
        });
      await request(app)
        .post('/preprints')
        .send(exampleVersion2)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, {
          result: true,
          message: 'OK',
        });

      await request(app)
        .get('/api/preprints/article.2')
        .expect({
          article: exampleVersion1,
          versions: {
            testid4: versionSummary1,
          },
        });
      await request(app)
        .get('/api/preprints/article.2?previews=true')
        .expect({
          article: exampleVersion2,
          versions: {
            testid4: versionSummary1,
            testid5: versionSummary2,
          },
        });
    });

    it('imports content with forward slash in ID', async () => {
      const app = createApp(articleStore);

      const exampleVersion = {
        ...enhancedArticle,
        id: 'testid6/v1',
        versionIdentifier: '1',
        msid: 'article.3',
      };

      await request(app)
        .post('/preprints')
        .send(exampleVersion)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, {
          result: true,
          message: 'OK',
        });

      await request(app)
        .get('/api/preprints/testid6/v1')
        .expect({
          article: exampleVersion,
          versions: {
            'testid6/v1': {
              ...versionSummary,
              id: 'testid6/v1',
              versionIdentifier: '1',
              msid: 'article.3',
            },
          },
        });
    });

    it('removes an article version with a given ID', async () => {
      const app = createApp(articleStore);

      const exampleVersion = {
        ...enhancedArticle,
        id: 'testid6/v1',
        versionIdentifier: '1',
        msid: 'article.3',
      };

      await request(app)
        .post('/preprints')
        .send(exampleVersion)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, {
          result: true,
          message: 'OK',
        });

      await request(app)
        .delete('/preprints/testid6/v1')
        .expect(200);
    });

    it('fails to remove a non-existant article version with a given ID', async () => {
      const app = createApp(articleStore);

      await request(app)
        .delete('/preprints/somethingNonExistant/v1')
        .expect(404, 'Article not found');
    });

    it('overwrites a version when given the same id', async () => {
      const app = createApp(articleStore);

      await request(app)
        .post('/preprints')
        .send(enhancedArticle)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, {
          result: true,
          message: 'OK',
        });

      const changedEnhancedArticle = { ...enhancedArticle, msid: 'foo' };
      const changedSummaryVersion = { ...versionSummary, msid: 'foo' };

      await request(app)
        .post('/preprints')
        .send(changedEnhancedArticle)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, {
          result: true,
          message: 'OK',
        });

      await request(app)
        .get('/api/preprints/testid3')
        .expect(200, {
          article: changedEnhancedArticle,
          versions: {
            testid3: changedSummaryVersion,
          },
        });
    });

    it('returns a 404 when an invalid identifier is used', async () => {
      const app = createApp(articleStore);
      await request(app)
        .get('/api/preprints/thisisnotanid')
        .expect(404, {
          result: false,
          message: 'no result found for: (thisisnotanid)',
        });
    });
  });

  describe('/api/preprints-no-content', () => {
    let app: Express;
    const enhancedArticle = {
      id: 'testid3',
      msid: 'testmsid',
      doi: 'doi1',
      volume: '1',
      eLocationId: 'RPtestid3',
      versionIdentifier: '1',
      versionDoi: 'publisher/testid1',
      article: {
        title: 'test article',
        authors: [
          {
            familyNames: ['Daffy'],
            givenNames: ['Duck'],
            affiliations: [{ name: 'ACME Labs' }],
            emails: ['daffy.duck@acme.org'],
          },
        ],
        abstract: 'This is the test abstract',
        licenses: [],
        content: 'This is some test content',
        references: [],
      },
      preprintDoi: 'preprint/testid1',
      preprintUrl: 'doi.org/preprint/testid1',
      preprintPosted: '2023-01-02T00:00:00.000Z',
      sentForReview: '2023-01-03T00:00:00.000Z',
      published: '2023-01-23T00:00:00.000Z',
      publishedYear: 2023,
      subjects: ['subject 1', 'subject 2'],
      license: 'https://creativecommons.org/licenses/by/4.0/',
    };
    const exampleVersion1 = {
      ...enhancedArticle,
      id: 'testid4',
      versionIdentifier: '1',
      msid: 'article.2',
      published: '2023-01-23T01:00:00.000Z',
    };
    const exampleVersion2 = {
      id: 'testid5',
      versionIdentifier: '2',
      msid: 'article.2',
      doi: 'test/article.2',
      preprintDoi: 'preprint/testdoi5',
      preprintUrl: 'http://preprints.org/preprint/testdoi5',
      preprintPosted: '2023-02-02T00:00:00.000Z',
      article: {
        title: 'Test Article 2',
        abstract: 'Test article 2 abstract',
        authors: [],
        content: '<article></article>',
        licenses: [],
        references: [],
      },
      published: null,
    };
    const exampleVersion3 = {
      ...enhancedArticle,
      id: 'testid6',
      versionIdentifier: '1',
      msid: 'article.3',
      published: '2023-01-23T00:00:00.000Z',
    };
    const exampleVersion4 = {
      ...enhancedArticle,
      id: 'testid6.2',
      versionIdentifier: '2',
      msid: 'article.3',
      published: '2023-01-24T00:00:00.000Z',
    };
    const exampleVersion5 = {
      ...enhancedArticle,
      id: 'testid7',
      versionIdentifier: '1',
      msid: 'article.4',
      published: `${new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]}T00:00:00.000Z`,
    };
    const exampleVersion6 = {
      ...enhancedArticle,
      id: 'testid8',
      versionIdentifier: '1',
      msid: 'article.5',
      published: '2023-01-22T00:00:00.000Z',
      subjects: ['subject 3'],
    };

    beforeEach(async () => {
      app = createApp(articleStore);

      await request(app)
        .post('/preprints')
        .send(exampleVersion1)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect((200), {
          result: true,
          message: 'OK',
        });
      await request(app)
        .post('/preprints')
        .send(exampleVersion2)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect((200), {
          result: true,
          message: 'OK',
        });
      await request(app)
        .post('/preprints')
        .send(exampleVersion3)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect((200), {
          result: true,
          message: 'OK',
        });
      await request(app)
        .post('/preprints')
        .send(exampleVersion4)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect((200), {
          result: true,
          message: 'OK',
        });
      await request(app)
        .post('/preprints')
        .send(exampleVersion5)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect((200), {
          result: true,
          message: 'OK',
        });
      await request(app)
        .post('/preprints')
        .send(exampleVersion6)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect((200), {
          result: true,
          message: 'OK',
        });
    });

    it('fetches a list of versions without content (no query parameters)', async () => {
      await request(app)
        .get('/api/preprints-no-content')
        .expect(200)
        .expect((response) => {
          expect(response.header['x-total-count']).toBe('3');
          expect(response.body.length).toBe(3);
          expect(response.body[0]).toEqual({
            id: 'testid6.2',
            msid: 'article.3',
            doi: 'doi1',
            volume: '1',
            eLocationId: 'RPtestid3',
            versionIdentifier: '2',
            versionDoi: 'publisher/testid1',
            article: {
              title: 'test article',
              authors: [
                {
                  familyNames: ['Daffy'],
                  givenNames: ['Duck'],
                  affiliations: [{ name: 'ACME Labs' }],
                  emails: ['daffy.duck@acme.org'],
                },
              ],
            },
            preprintDoi: 'preprint/testid1',
            preprintUrl: 'doi.org/preprint/testid1',
            preprintPosted: '2023-01-02T00:00:00.000Z',
            sentForReview: '2023-01-03T00:00:00.000Z',
            published: '2023-01-24T00:00:00.000Z',
            publishedYear: 2023,
            subjects: ['subject 1', 'subject 2'],
            license: 'https://creativecommons.org/licenses/by/4.0/',
            firstPublished: '2023-01-23T00:00:00.000Z',
          });
          expect(response.body[1]).toEqual({
            id: 'testid4',
            msid: 'article.2',
            doi: 'doi1',
            volume: '1',
            eLocationId: 'RPtestid3',
            versionIdentifier: '1',
            versionDoi: 'publisher/testid1',
            article: {
              title: 'test article',
              authors: [
                {
                  familyNames: ['Daffy'],
                  givenNames: ['Duck'],
                  affiliations: [{ name: 'ACME Labs' }],
                  emails: ['daffy.duck@acme.org'],
                },
              ],
            },
            preprintDoi: 'preprint/testid1',
            preprintUrl: 'doi.org/preprint/testid1',
            preprintPosted: '2023-01-02T00:00:00.000Z',
            sentForReview: '2023-01-03T00:00:00.000Z',
            published: '2023-01-23T01:00:00.000Z',
            publishedYear: 2023,
            subjects: ['subject 1', 'subject 2'],
            license: 'https://creativecommons.org/licenses/by/4.0/',
            firstPublished: '2023-01-23T01:00:00.000Z',
          });
          expect(response.body[2]).toEqual({
            id: 'testid8',
            msid: 'article.5',
            doi: 'doi1',
            volume: '1',
            eLocationId: 'RPtestid3',
            versionIdentifier: '1',
            versionDoi: 'publisher/testid1',
            article: {
              title: 'test article',
              authors: [
                {
                  familyNames: ['Daffy'],
                  givenNames: ['Duck'],
                  affiliations: [{ name: 'ACME Labs' }],
                  emails: ['daffy.duck@acme.org'],
                },
              ],
            },
            preprintDoi: 'preprint/testid1',
            preprintUrl: 'doi.org/preprint/testid1',
            preprintPosted: '2023-01-02T00:00:00.000Z',
            sentForReview: '2023-01-03T00:00:00.000Z',
            published: '2023-01-22T00:00:00.000Z',
            publishedYear: 2023,
            subjects: ['subject 3'],
            license: 'https://creativecommons.org/licenses/by/4.0/',
            firstPublished: '2023-01-22T00:00:00.000Z',
          });
        });
    });

    it('fetches a list of versions without content with use-date=published', async () => {
      await request(app)
        .get('/api/preprints-no-content?use-date=firstPublished')
        .expect(200)
        .expect((response) => {
          expect(response.header['x-total-count']).toBe('3');
          expect(response.body.length).toBe(3);
          expect(response.body[0]).toEqual({
            id: 'testid4',
            msid: 'article.2',
            doi: 'doi1',
            volume: '1',
            eLocationId: 'RPtestid3',
            versionIdentifier: '1',
            versionDoi: 'publisher/testid1',
            article: {
              title: 'test article',
              authors: [
                {
                  familyNames: ['Daffy'],
                  givenNames: ['Duck'],
                  affiliations: [{ name: 'ACME Labs' }],
                  emails: ['daffy.duck@acme.org'],
                },
              ],
            },
            preprintDoi: 'preprint/testid1',
            preprintUrl: 'doi.org/preprint/testid1',
            preprintPosted: '2023-01-02T00:00:00.000Z',
            sentForReview: '2023-01-03T00:00:00.000Z',
            published: '2023-01-23T01:00:00.000Z',
            publishedYear: 2023,
            subjects: ['subject 1', 'subject 2'],
            license: 'https://creativecommons.org/licenses/by/4.0/',
            firstPublished: '2023-01-23T01:00:00.000Z',
          });
          expect(response.body[1]).toEqual({
            id: 'testid6.2',
            msid: 'article.3',
            doi: 'doi1',
            volume: '1',
            eLocationId: 'RPtestid3',
            versionIdentifier: '2',
            versionDoi: 'publisher/testid1',
            article: {
              title: 'test article',
              authors: [
                {
                  familyNames: ['Daffy'],
                  givenNames: ['Duck'],
                  affiliations: [{ name: 'ACME Labs' }],
                  emails: ['daffy.duck@acme.org'],
                },
              ],
            },
            preprintDoi: 'preprint/testid1',
            preprintUrl: 'doi.org/preprint/testid1',
            preprintPosted: '2023-01-02T00:00:00.000Z',
            sentForReview: '2023-01-03T00:00:00.000Z',
            published: '2023-01-24T00:00:00.000Z',
            publishedYear: 2023,
            subjects: ['subject 1', 'subject 2'],
            license: 'https://creativecommons.org/licenses/by/4.0/',
            firstPublished: '2023-01-23T00:00:00.000Z',
          });
          expect(response.body[2]).toEqual({
            id: 'testid8',
            msid: 'article.5',
            doi: 'doi1',
            volume: '1',
            eLocationId: 'RPtestid3',
            versionIdentifier: '1',
            versionDoi: 'publisher/testid1',
            article: {
              title: 'test article',
              authors: [
                {
                  familyNames: ['Daffy'],
                  givenNames: ['Duck'],
                  affiliations: [{ name: 'ACME Labs' }],
                  emails: ['daffy.duck@acme.org'],
                },
              ],
            },
            preprintDoi: 'preprint/testid1',
            preprintUrl: 'doi.org/preprint/testid1',
            preprintPosted: '2023-01-02T00:00:00.000Z',
            sentForReview: '2023-01-03T00:00:00.000Z',
            published: '2023-01-22T00:00:00.000Z',
            publishedYear: 2023,
            subjects: ['subject 3'],
            license: 'https://creativecommons.org/licenses/by/4.0/',
            firstPublished: '2023-01-22T00:00:00.000Z',
          });
        });
    });

    it('fetches a list of versions without content (with per-page query parameter)', async () => {
      await request(app)
        .get('/api/preprints-no-content?per-page=1&page=1')
        .expect(200)
        .expect((response) => {
          expect(response.header['x-total-count']).toBe('3');
          expect(response.body.length).toBe(1);
          expect(response.body[0].id).toBe('testid6.2');
        });

      await request(app)
        .get('/api/preprints-no-content?per-page=1&page=2')
        .expect(200)
        .expect((response) => {
          expect(response.header['x-total-count']).toBe('3');
          expect(response.body.length).toBe(1);
          expect(response.body[0].id).toBe('testid4');
        });

      await request(app)
        .get('/api/preprints-no-content?per-page=1&page=3')
        .expect(200)
        .expect((response) => {
          expect(response.header['x-total-count']).toBe('3');
          expect(response.body.length).toBe(1);
          expect(response.body[0].id).toBe('testid8');
        });
    });

    it('fetches a list of versions without content (with order query parameter)', async () => {
      await request(app)
        .get('/api/preprints-no-content?per-page=2&page=1&order=asc')
        .expect(200)
        .expect((response) => {
          expect(response.header['x-total-count']).toBe('3');
          expect(response.body.length).toBe(2);
          expect(response.body[0].id).toBe('testid8');
          expect(response.body[1].id).toBe('testid4');
        });

      await request(app)
        .get('/api/preprints-no-content?per-page=2&page=2&order=asc')
        .expect(200)
        .expect((response) => {
          expect(response.header['x-total-count']).toBe('3');
          expect(response.body.length).toBe(1);
          expect(response.body[0].id).toBe('testid6.2');
        });

      await request(app)
        .get('/api/preprints-no-content?per-page=2&page=3&order=asc')
        .expect(200)
        .expect((response) => {
          expect(response.header['x-total-count']).toBe('3');
          expect(response.body.length).toBe(0);
        });
    });

    it('fetches a list of versions without content (with start-date query parameter)', async () => {
      await request(app)
        .get('/api/preprints-no-content?start-date=2023-01-24')
        .expect(200)
        .expect((response) => {
          expect(response.header['x-total-count']).toBe('1');
          expect(response.body.length).toBe(1);
          expect(response.body[0].id).toBe('testid6.2');
          expect(response.body[0].firstPublished).toBe('2023-01-23T00:00:00.000Z');
        });

      await request(app)
        .get('/api/preprints-no-content?start-date=2023-01-23&order=asc&per-page=1&page=2')
        .expect(200)
        .expect((response) => {
          expect(response.header['x-total-count']).toBe('2');
          expect(response.body.length).toBe(1);
          expect(response.body[0].id).toBe('testid6.2');
        });
    });

    it('fetches a list of versions without content (with end-date query parameter)', async () => {
      await request(app)
        .get('/api/preprints-no-content?end-date=2023-01-23')
        .expect(200)
        .expect((response) => {
          expect(response.header['x-total-count']).toBe('2');
          expect(response.body.length).toBe(2);
          expect(response.body[0].id).toBe('testid4');
          expect(response.body[1].id).toBe('testid8');
        });
    });

    it('fetches a list of versions without content (with start-date, end-date and use-date query parameters)', async () => {
      await request(app)
        .get('/api/preprints-no-content?start-date=2023-01-01&end-date=2023-01-23&use-date=firstPublished')
        .expect(200)
        .expect((response) => {
          expect(response.header['x-total-count']).toBe('3');
          expect(response.body.length).toBe(3);
          expect(response.body[0].id).toBe('testid4');
          expect(response.body[1].id).toBe('testid6.2');
          expect(response.body[2].id).toBe('testid8');
        });
    });

    it('returns 200 if there is no content found', async () => {
      await request(app)
        .get('/api/preprints-no-content?start-end=2022-01-01&end-date=2022-01-02')
        .expect(200)
        .expect((response) => {
          expect(response.header['x-total-count']).toBe('0');
          expect(response.body.length).toBe(0);
        });
    });
  });

  describe('/api/citations/:publisherId/:articleId/bibtex', () => {
    const bibtex = `
    @article{Carberry_2008,
      doi = {10.1101/123456},
      url = {https://doi.org/10.5555/12345678},
      year = 2008,
      month = {aug},
      publisher = {Test accounts},
      volume = {5},
      number = {11},
      pages = {1--3},
      author = {Josiah Carberry},
      title = {Toward a Unified Theory of High-Energy Metaphysics: Silly String Theory},
      journal = {Journal of Psychoceramics}
    }
    `;

    const encodedBibtex = `
    @article{Carberry_2008,
      doi = {10.1101/123456},
      url = {https://doi.org/10.5555%2F12345678},
      year = 2008,
      month = {aug},
      publisher = {Test accounts},
      volume = {5},
      number = {11},
      pages = {1--3},
      author = {Josiah Carberry},
      title = {Toward a Unified Theory of High-Energy Metaphysics: Silly String Theory},
      journal = {Journal of Psychoceramics}
    }
    `;

    it('returns a BibTeX file with the correct information', async () => {
      const app = createApp(articleStore);

      // Needed for jest mock of axios
      // @ts-ignore
      axios.get.mockImplementation(() => Promise.resolve({ data: bibtex }));

      await request(app)
        .get('/api/citations/10.5555/12345678/bibtex')
        .expect(200)
        .expect('Content-Type', 'application/x-bibtex; charset=utf-8');
    });

    it('returns a 400 when the crossref BibTeX call fails', async () => {
      const app = createApp(articleStore);

      // Needed for jest mock of axios
      // @ts-ignore
      axios.get.mockImplementation(() => Promise.reject());

      await request(app)
        .get('/api/citations/10.5555/12345678/bibtex')
        .expect(404);
    });

    it('formats the BibTeX data to be URI decoded', async () => {
      const app = createApp(articleStore);

      // Needed for jest mock of axios
      // @ts-ignore
      axios.get.mockImplementation(() => Promise.resolve({ data: encodedBibtex }));

      await request(app)
        .get('/api/citations/10.5555/12345678/bibtex')
        .expect(200, bibtex)
        .expect('Content-Type', 'application/x-bibtex; charset=utf-8');
    });
  });

  describe('/api/citations/:publisherId/:articleId/ris', () => {
    const ris = `
    TY  - GENERIC
    DO  - 10.7554/elife.85646.1
    UR  - http://dx.doi.org/10.7554/eLife.85646.1
    TI  - Parahippocampal neurons encode task-relevant information for goal-directed navigation
    AU  - Gonzalez, Alexander
    AU  - Giocomo, Lisa M.
    PY  - 2023
    DA  - 2023/03/09
    PB  - eLife Sciences Publications, Ltd
    ER  -
    `;

    const encodedRis = `
    TY  - GENERIC
    DO  - 10.7554/elife.85646.1
    UR  - http://dx.doi.org/10.7554%2FeLife.85646.1
    TI  - Parahippocampal neurons encode task-relevant information for goal-directed navigation
    AU  - Gonzalez, Alexander
    AU  - Giocomo, Lisa M.
    PY  - 2023
    DA  - 2023/03/09
    PB  - eLife Sciences Publications, Ltd
    ER  -
    `;

    it('returns an RIS file with the correct information', async () => {
      const app = createApp(articleStore);

      // Needed for jest mock of axios
      // @ts-ignore
      axios.get.mockImplementation(() => Promise.resolve({ data: ris }));

      await request(app)
        .get('/api/citations/10.5555/12345678/ris')
        .expect(200)
        .expect('Content-Type', 'application/x-research-info-systems; charset=utf-8');
    });

    it('returns a 400 when the crossref RIS call fails', async () => {
      const app = createApp(articleStore);

      // Needed for jest mock of axios
      // @ts-ignore
      axios.get.mockImplementation(() => Promise.reject());

      await request(app)
        .get('/api/citations/10.5555/12345678/ris')
        .expect(404);
    });

    it('formats the RIS data to be URI decoded', async () => {
      const app = createApp(articleStore);

      // Needed for jest mock of axios
      // @ts-ignore
      axios.get.mockImplementation(() => Promise.resolve({ data: encodedRis }));

      await request(app)
        .get('/api/citations/10.5555/12345678/ris')
        .expect(200, ris)
        .expect('Content-Type', 'application/x-research-info-systems; charset=utf-8');
    });
  });
});
