import { createReadStream } from 'fs';
import request from 'supertest';
import axios from 'axios';
import { mockClient } from 'aws-sdk-client-mock';
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { sdkStreamMixin } from '@aws-sdk/util-stream-node';
import { MongoClient } from 'mongodb';
import { createApp } from '../src/app';
import { docmapMock as docmapMock1, reviewMocks as reviewMocks1 } from './data/10.1101/123456/docmap-mock';
import { docmapMock as docmapMock2, reviewMocks as reviewMocks2 } from './data/10.1101/654321/docmap-mock';
import mockBody1 from './mock-data/mock-body-1.json';
import mockBody2 from './mock-data/mock-body-2.json';
import mockBody3 from './mock-data/mock-body-3.json';
import { ArticleRepository } from '../src/model/model';
import { createMongoDBArticleRepositoryFromMongoClient } from '../src/model/mongodb/mongodb-repository';

jest.mock('axios');

const generateAgent = async (articleStore: ArticleRepository) => {
  const app = await createApp(articleStore);

  return request(app);
};

describe('server tests', () => {
  let articleStore: ArticleRepository;
  let connection: MongoClient;

  beforeEach(async () => {
    // mock the s3 client
    const fooStream = createReadStream('./integration-tests/data/10.1101/123456/123456.xml');
    const barStream = createReadStream('./integration-tests/data/10.1101/654321/654321.xml');
    const bazStream = createReadStream('./integration-tests/data/10.1101/456/789/789.xml');

    mockClient(S3Client)
      .on(ListObjectsV2Command)
      .resolves({
        Contents: [
          { Key: 'data/10.1101/123456/123456.xml' },
          { Key: 'data/10.1101/456/789/v1/789.xml' },
          { Key: 'data/10.1101/654321/654321.xml' },
        ],
      })
      .on(GetObjectCommand, { Key: 'data/10.1101/123456/123456.xml' })
      .resolves({ Body: sdkStreamMixin(fooStream) })
      .on(GetObjectCommand, { Key: 'data/10.1101/654321/654321.xml' })
      .resolves({ Body: sdkStreamMixin(barStream) })
      .on(GetObjectCommand, { Key: 'data/10.1101/456/789/v1/789.xml' })
      .resolves({ Body: sdkStreamMixin(bazStream) });

    if (process.env.MONGO_URL === undefined) {
      throw Error('Cannot connect to jest-mongodb');
    }
    connection = await MongoClient.connect(process.env.MONGO_URL);
    await connection.db('epp').collection('articles').deleteMany({});
    await connection.db('epp').collection('versioned_articles').deleteMany({});
    articleStore = await createMongoDBArticleRepositoryFromMongoClient(connection);
  });

  afterEach(() => {
    mockClient(S3Client).reset();
    connection.close();
  });

  describe('/api/reviewed-preprints', () => {
    describe('empty database', () => {
      it('should redirect from / to /api/reviewed-preprints/', async () => {
        await request(createApp(articleStore))
          .get('/')
          .expect(302)
          .expect('Location', '/api/reviewed-preprints/');
      });

      it('should return an empty json array with no data', async () => {
        await request(createApp(articleStore))
          .get('/api/reviewed-preprints')
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect({
            items: [],
            total: 0,
          });
      });
    });

    describe('after import', () => {
      it('should return a json array with the correct summaries', async () => {
        const agent = await generateAgent(articleStore);

        await agent.post('/import')
          .expect(200)
          .expect({
            status: true,
            message: 'Import completed',
          });

        await agent.get('/api/reviewed-preprints')
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect((response) => {
            expect(response.body.total).toBe(3);
            expect(response.body.items).toContainEqual({
              id: '10.1101/123456',
              doi: '10.1101/123456',
              title: 'Our Pondering of World Domination!',
              date: '2021-11-19T00:00:00.000Z',
            });
            expect(response.body.items).toContainEqual({
              id: '10.1101/654321',
              doi: '10.1101/654321',
              title: 'Dangers of roadrunners with reality warping powers.',
              date: '2021-11-19T00:00:00.000Z',
            });
            expect(response.body.items).toContainEqual({
              id: '10.1101/456/789/v1', // This is the id from the path, rather than the DOI
              doi: '10.1101/456/789',
              title: 'The Wild Adventures of Wile E. Coyote vs Reality-Bending Roadrunners.',
              date: '2021-11-19T00:00:00.000Z',
            });
          });
      });
    });
  });

  describe('/import', () => {
    it('import the articles', async () => {
      const app = await createApp(articleStore);

      return request(app)
        .post('/import')
        .expect(200)
        .expect({
          status: true,
          message: 'Import completed',
        });
    });

    it('import new articles', async () => {
      const app = await createApp(articleStore);

      // set the mock for single manuscript to import
      mockClient(S3Client)
        .on(ListObjectsV2Command)
        .resolves({
          Contents: [
            { Key: 'data/10.1101/123456/123456.xml' },
          ],
        })
        .on(GetObjectCommand, { Key: 'data/10.1101/123456/123456.xml' })
        .resolves({ Body: sdkStreamMixin(createReadStream('./integration-tests/data/10.1101/123456/123456.xml')) });

      await request(app)
        .post('/import')
        .expect(200)
        .expect({
          status: true,
          message: 'Import completed',
        });

      // reset the mock for second set of imports
      mockClient(S3Client)
        .on(ListObjectsV2Command)
        .resolves({
          Contents: [
            { Key: 'data/10.1101/456/789/789.xml' },
          ],
        })
        .on(GetObjectCommand, { Key: 'data/10.1101/456/789/789.xml' })
        .resolves({ Body: sdkStreamMixin(createReadStream('./integration-tests/data/10.1101/456/789/789.xml')) });

      await request(app).post('/import')
        .expect(200)
        .expect({
          status: true,
          message: 'Import completed',
        });

      // reset the mock for third set of imports
      mockClient(S3Client)
        .on(ListObjectsV2Command)
        .resolves({
          Contents: [
            { Key: 'data/10.1101/654321/654321.xml' },
          ],
        })
        .on(GetObjectCommand, { Key: 'data/10.1101/654321/654321.xml' })
        .resolves({ Body: sdkStreamMixin(createReadStream('./integration-tests/data/10.1101/654321/654321.xml')) });

      await request(app).post('/import')
        .expect(200)
        .expect({
          status: true,
          message: 'Import completed',
        });
    });

    it('returns success on reimport and message', async () => {
      const app = await createApp(articleStore);

      await request(app)
        .post('/import')
        .expect(200)
        .expect({
          status: true,
          message: 'Import completed',
        });

      // reset the mock for second set of imports
      mockClient(S3Client)
        .on(ListObjectsV2Command)
        .resolves({
          Contents: [
            { Key: 'data/10.1101/123456/123456.xml' },
            { Key: 'data/10.1101/654321/654321.xml' },
            { Key: 'data/10.1101/456/789/789.xml' },
          ],
        })
        .on(GetObjectCommand, { Key: 'data/10.1101/123456/123456.xml' })
        .resolves({ Body: sdkStreamMixin(createReadStream('./integration-tests/data/10.1101/123456/123456.xml')) })
        .on(GetObjectCommand, { Key: 'data/10.1101/654321/654321.xml' })
        .resolves({ Body: sdkStreamMixin(createReadStream('./integration-tests/data/10.1101/654321/654321.xml')) })
        .on(GetObjectCommand, { Key: 'data/10.1101/456/789/789.xml' })
        .resolves({ Body: sdkStreamMixin(createReadStream('./integration-tests/data/10.1101/456/789/789.xml')) });

      await request(app).post('/import')
        .expect(200)
        .expect({
          status: true,
          message: 'Import completed',
        });
    });
  });

  describe('/api/reviewed-preprints/:doi(*)/metadata', () => {
    it('returns a 500 when an incorrect doi is provided', async () => {
      await request(createApp(articleStore))
        .get('/api/reviewed-preprints/1/2/metadata')
        .expect(500);
    });

    it('returns the correct metadata for the test articles', async () => {
      const agent = await generateAgent(articleStore);

      await agent.post('/import')
        .expect(200)
        .expect({
          status: true,
          message: 'Import completed',
        });

      await agent.get('/api/reviewed-preprints/10.1101/123456/metadata')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({
          authors: [
            {
              type: 'Person',
              affiliations: [
                {
                  type: 'Organization',
                  address: {
                    type: 'PostalAddress',
                    addressCountry: 'USA',
                  },
                  name: 'ACME Labs, New York',
                }],
              familyNames: ['Brain'],
              emails: ['brain@acmelabs.edu.au'],
            }, {
              type: 'Person',
              affiliations: [
                {
                  type: 'Organization',
                  address: {
                    type: 'PostalAddress',
                    addressCountry: 'USA',
                  },
                  name: 'ACME Labs, New York',
                }],
              familyNames: ['Pinky'],
            }],
          doi: '10.1101/123456',
          title: 'Our Pondering of World Domination!',
          msas: [],
          importance: '',
          strengthOfEvidence: '',
          views: 1,
          citations: 2,
          tweets: 3,
          abstract: [{ type: 'Paragraph', content: ['An abstract.'] }],
          references: [],
        });

      await agent.get('/api/reviewed-preprints/10.1101/654321/metadata')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({
          authors: [
            {
              type: 'Person',
              affiliations: [
                {
                  type: 'Organization',
                  address: {
                    type: 'PostalAddress',
                    addressCountry: 'New Zealand',
                  },
                  name: 'ACME Demolitions, Wellington',
                }],
              familyNames: ['Coyote'],
              givenNames: ['Wile', 'E'],
              emails: ['w.coyote@acme.demolitions.au'],
              identifiers: [
                { type: 'orcid', value: 'http://orcid.org/0000-0002-1234-5678' },
              ],
            }, {
              type: 'Person',
              affiliations: [
                {
                  type: 'Organization',
                  address: {
                    type: 'PostalAddress',
                    addressCountry: 'New Zealand',
                  },
                  name: 'ACME Demolitions, Wellington',
                }],
              familyNames: ['Devil'],
              givenNames: ['Taz'],
              identifiers: [
                { type: 'orcid', value: 'http://orcid.org/0000-0002-1234-5679' },
              ],
            }],
          doi: '10.1101/654321',
          title: 'Dangers of roadrunners with reality warping powers.',
          msas: [],
          importance: '',
          strengthOfEvidence: '',
          views: 1,
          citations: 2,
          tweets: 3,
          abstract: [{ type: 'Paragraph', content: ['Why not to mess with an agent of chaos.'] }],
          references: [],
        });
    });

    it('returns the correct metadata for the test article by ID', async () => {
      const agent = await generateAgent(articleStore);

      await agent.post('/import')
        .expect(200)
        .expect({
          status: true,
          message: 'Import completed',
        });

      await agent.get('/api/reviewed-preprints/10.1101/456/789/v1/metadata')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({
          authors: [
            {
              type: 'Person',
              affiliations: [
                {
                  type: 'Organization',
                  address: {
                    type: 'PostalAddress',
                    addressCountry: 'USA',
                  },
                  name: 'ACME Labs, New York',
                }],
              familyNames: ['Brain'],
              emails: ['brain@acmelabs.edu.au'],
            }, {
              type: 'Person',
              affiliations: [
                {
                  type: 'Organization',
                  address: {
                    type: 'PostalAddress',
                    addressCountry: 'USA',
                  },
                  name: 'ACME Labs, New York',
                }],
              familyNames: ['Pinky'],
            }],
          doi: '10.1101/456/789',
          title: 'The Wild Adventures of Wile E. Coyote vs Reality-Bending Roadrunners.',
          msas: [],
          importance: '',
          strengthOfEvidence: '',
          views: 1,
          citations: 2,
          tweets: 3,
          abstract: [{ type: 'Paragraph', content: ['An abstract.'] }],
          references: [],
        });

      await agent.get('/api/reviewed-preprints/10.1101/654321/metadata')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({
          authors: [
            {
              type: 'Person',
              affiliations: [
                {
                  type: 'Organization',
                  address: {
                    type: 'PostalAddress',
                    addressCountry: 'New Zealand',
                  },
                  name: 'ACME Demolitions, Wellington',
                }],
              familyNames: ['Coyote'],
              givenNames: ['Wile', 'E'],
              emails: ['w.coyote@acme.demolitions.au'],
              identifiers: [
                { type: 'orcid', value: 'http://orcid.org/0000-0002-1234-5678' },
              ],
            }, {
              type: 'Person',
              affiliations: [
                {
                  type: 'Organization',
                  address: {
                    type: 'PostalAddress',
                    addressCountry: 'New Zealand',
                  },
                  name: 'ACME Demolitions, Wellington',
                }],
              familyNames: ['Devil'],
              givenNames: ['Taz'],
              identifiers: [
                { type: 'orcid', value: 'http://orcid.org/0000-0002-1234-5679' },
              ],
            }],
          doi: '10.1101/654321',
          title: 'Dangers of roadrunners with reality warping powers.',
          msas: [],
          importance: '',
          strengthOfEvidence: '',
          views: 1,
          citations: 2,
          tweets: 3,
          abstract: [{ type: 'Paragraph', content: ['Why not to mess with an agent of chaos.'] }],
          references: [],
        });
    });
  });

  describe('/api/reviewed-preprints/:doi(*)/content', () => {
    it('returns a 500 when an incorrect doi is provided', async () => {
      await request(createApp(articleStore))
        .get('/api/reviewed-preprints/1/2/content')
        .expect(500);
    });

    it('returns a 200 with the article content for the two test articles', async () => {
      const agent = await generateAgent(articleStore);

      await agent.post('/import')
        .expect(200)
        .expect({
          status: true,
          message: 'Import completed',
        });

      await agent.get('/api/reviewed-preprints/10.1101/123456/content')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect([
          {
            type: 'Heading', id: 's1', depth: 1, content: ['Section'],
          },
          { type: 'Paragraph', content: ['I am an article.'] },
          { type: 'ThematicBreak' },
          { type: 'Heading', depth: 1, content: ['Acknowledgements'] },
          {
            type: 'Paragraph',
            content: [
              'The authors acknowledge the Gene alterations done by ACME Labs give rise to their own genius\n            ',
            ],
          },
        ]);

      await agent.get('/api/reviewed-preprints/10.1101/654321/content')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect([
          {
            type: 'Heading', id: 's1', depth: 1, content: ['Section'],
          },
          { type: 'Paragraph', content: ['Run..... just run!'] },
          { type: 'ThematicBreak' },
          { type: 'Heading', depth: 1, content: ['Acknowledgements'] },
          {
            type: 'Paragraph',
            content: [
              'The authors acknowledge the wide catalog of ACME products used for the experiments in this paper.\n            ',
            ],
          },
        ]);
    });
  });

  describe('/api/reviewed-preprints/:msid(*)/reviews', () => {
    it('returns a 500 when it cant get a docmap', async () => {
      // Needed for jest mock of axios
      // @ts-ignore
      axios.get.mockRejectedValue({});

      await request(createApp(articleStore))
        .get('/api/reviewed-preprints/1/2/reviews')
        .expect(500);
    });

    it('returns a 500 when it cant fetch the html', async () => {
      // Needed for jest mock of axios
      // @ts-ignore
      axios.get.mockImplementation((url: string) => {
        switch (url) {
          case 'https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v2/by-publisher/elife/get-by-manuscript-id?manuscript_id=88888':
            return Promise.resolve({
              data: docmapMock1,
            });
          default:
            return Promise.reject();
        }
      });

      const agent = await generateAgent(articleStore);
      await agent.post('/import')
        .expect(200)
        .expect({
          status: true,
          message: 'Import completed',
        });
      await agent.get('/api/reviewed-preprints/88888/reviews')
        .expect(404); // TODO: why is this a 404?
    });

    it('returns a 500 when it cant get an evaluation-summary', async () => {
      // Needed for jest mock of axios
      // @ts-ignore
      axios.get.mockImplementation((url: string) => {
        switch (url) {
          case 'https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v2/by-publisher/elife/get-by-manuscript-id?manuscript_id=88888':
            return Promise.resolve({
              data: docmapMock1,
            });
          case 'https://sciety.org/evaluations/hypothesis:hardcoded-elife-article-review-one/content':
            return Promise.resolve({
              data: reviewMocks1[url],
            });
          default:
            return Promise.reject();
        }
      });

      const agent = await generateAgent(articleStore);
      await agent.post('/import')
        .expect(200)
        .expect({
          status: true,
          message: 'Import completed',
        });
      await agent.get('/api/reviewed-preprints/88888/reviews')
        .expect(404); // TODO: why is this a 404?
    });

    it('returns a 500 when the docmap has no evaluation-summary', async () => {
      // Needed for jest mock of axios
      // @ts-ignore
      axios.get.mockImplementation((url: string) => {
        switch (url) {
          case 'https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v2/by-publisher/elife/get-by-manuscript-id?manuscript_id=88888':
            return Promise.resolve({
              data: docmapMock2,
            });
          case 'https://sciety.org/evaluations/hypothesis:hardcoded-elife-article-review-one/content':
          case 'https://sciety.org/evaluations/hypothesis:hardcoded-elife-article-reply/content':
          case 'https://sciety.org/evaluations/hypothesis:hardcoded-elife-article-evaluation-summary/content':
            return Promise.resolve({
              data: reviewMocks2[url],
            });
          default:
            return Promise.reject();
        }
      });

      const agent = await generateAgent(articleStore);
      await agent.post('/import')
        .expect(200)
        .expect({
          status: true,
          message: 'Import completed',
        });
      await agent.get('/api/reviewed-preprints/88888/reviews')
        .expect(500);
    });

    it('returns a 200 with a peer review object for each article', async () => {
      // Needed for jest mock of axios
      // @ts-ignore
      axios.get.mockImplementation((url: string) => {
        switch (url) {
          case 'https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v2/by-publisher/elife/get-by-manuscript-id?manuscript_id=88888':
            return Promise.resolve({
              data: docmapMock1,
            });
          case 'https://sciety.org/evaluations/hypothesis:hardcoded-elife-article-review-one/content':
          case 'https://sciety.org/evaluations/hypothesis:hardcoded-elife-article-reply/content':
          case 'https://sciety.org/evaluations/hypothesis:hardcoded-elife-article-evaluation-summary/content':
            return Promise.resolve({
              data: reviewMocks1[url],
            });
          default:
            return Promise.reject();
        }
      });

      const agent = await generateAgent(articleStore);
      await agent.post('/import')
        .expect(200)
        .expect({
          status: true,
          message: 'Import completed',
        });
      await agent.get('/api/reviewed-preprints/88888/reviews')
        .expect(200)
        .expect({
          reviews: [
            {
              text: 'one',
              date: '2022-02-15T09:43:12.593Z',
              reviewType: 'review-article',
              participants: [],
            },
          ],
          evaluationSummary: {
            text: 'summary',
            date: '2022-02-15T09:43:15.348Z',
            reviewType: 'evaluation-summary',
            participants: [
              { name: 'Bugs Bunny', role: 'Senior Editor', institution: 'ACME University, United States' },
              { name: 'Daffy Duck', role: 'Reviewing Editor', institution: 'ACME University, United States' },
            ],
          },
          authorResponse: {
            text: 'reply',
            date: '2022-02-15T11:24:05.730Z',
            reviewType: 'reply',
            participants: [],
          },
        });
    });
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
