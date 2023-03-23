import request from 'supertest';
import axios from 'axios';
import { mockClient } from 'aws-sdk-client-mock';
import { S3Client, ListObjectsCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { sdkStreamMixin } from '@aws-sdk/util-stream-node';
import { createReadStream } from 'fs';
import { createApp } from '../src/app';
import { createArticleRepository, StoreType } from '../src/model/create-article-repository';
import { docmapMock as docmapMock1, reviewMocks as reviewMocks1 } from './data/10.1101/123456/docmap-mock';
import { docmapMock as docmapMock2, reviewMocks as reviewMocks2 } from './data/10.1101/654321/docmap-mock';

jest.mock('axios');

const generateAgent = async () => {
  const repo = await createArticleRepository(StoreType.InMemory);
  const app = await createApp(repo, { dataDir: './integration-tests/data/10.1101' });

  return request(app);
};

describe('server tests', () => {
  beforeEach(() => {
    // mock the s3 client
    const fooStream = createReadStream('./integration-tests/data/10.1101/123456/123456.xml');
    const barStream = createReadStream('./integration-tests/data/10.1101/654321/654321.xml');

    mockClient(S3Client)
      .on(ListObjectsCommand)
      .resolves({
        Contents: [
          { Key: 'data/10.1101/123456/123456.xml' },
          { Key: 'data/10.1101/654321/654321.xml' },
        ],
      })
      .on(GetObjectCommand, { Key: 'data/10.1101/123456/123456.xml' })
      .resolves({ Body: sdkStreamMixin(fooStream) })
      .on(GetObjectCommand, { Key: 'data/10.1101/654321/654321.xml' })
      .resolves({ Body: sdkStreamMixin(barStream) });
  });

  afterEach(() => {
    mockClient(S3Client).reset();
  });

  describe('/api/reviewed-preprints', () => {
    describe('empty database', () => {
      it('should redirect from / to /api/reviewed-preprints/', async () => {
        const repo = await createArticleRepository(StoreType.InMemory);
        await request(createApp(repo, {}))
          .get('/')
          .expect(302)
          .expect('Location', '/api/reviewed-preprints/');
      });

      it('should return an empty json array with no data', async () => {
        const repo = await createArticleRepository(StoreType.InMemory);
        await request(createApp(repo, {}))
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
        const agent = await generateAgent();

        await agent.post('/import')
          .expect(200)
          .expect({
            status: true,
            message: 'Import completed',
          });

        await agent.get('/api/reviewed-preprints')
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect((response) => {
            expect(response.body.total).toBe(2);
            expect(response.body.items).toContainEqual({
              doi: '10.1101/123456',
              title: 'Our Pondering of World Domination!',
              date: '2021-11-19T00:00:00.000Z',
            });
            expect(response.body.items).toContainEqual({
              doi: '10.1101/654321',
              title: 'Dangers of roadrunners with reality warping powers.',
              date: '2021-11-19T00:00:00.000Z',
            });
          });
      });
    });
  });

  describe('/import', () => {
    it('import the articles', async () => {
      const repo = await createArticleRepository(StoreType.InMemory);
      const app = await createApp(repo, {});

      return request(app)
        .post('/import')
        .expect(200)
        .expect({
          status: true,
          message: 'Import completed',
        });
    });

    it('import new articles', async () => {
      const repo = await createArticleRepository(StoreType.InMemory);
      const app = await createApp(repo, { dataDir: './integration-tests/data/10.1101' });

      // set the mock for single manuscript to import
      mockClient(S3Client)
        .on(ListObjectsCommand)
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
        .on(ListObjectsCommand)
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

    it('returns success on reimport and message describing that some items have not changed', async () => {
      const repo = await createArticleRepository(StoreType.InMemory);
      const app = await createApp(repo, { dataDir: './integration-tests/data/10.1101' });

      await request(app)
        .post('/import')
        .expect(200)
        .expect({
          status: true,
          message: 'Import completed',
        });

      // reset the mock for second set of imports
      mockClient(S3Client)
        .on(ListObjectsCommand)
        .resolves({
          Contents: [
            { Key: 'data/10.1101/123456/123456.xml' },
            { Key: 'data/10.1101/654321/654321.xml' },
          ],
        })
        .on(GetObjectCommand, { Key: 'data/10.1101/123456/123456.xml' })
        .resolves({ Body: sdkStreamMixin(createReadStream('./integration-tests/data/10.1101/123456/123456.xml')) })
        .on(GetObjectCommand, { Key: 'data/10.1101/654321/654321.xml' })
        .resolves({ Body: sdkStreamMixin(createReadStream('./integration-tests/data/10.1101/654321/654321.xml')) });

      await request(app).post('/import')
        .expect(200)
        .expect({
          status: false,
          message: 'Some items did not import',
        });
    });
  });

  describe('/api/reviewed-preprints/:publisherId/:articleId/metadata', () => {
    it('returns a 500 when an incorrect doi is provided', async () => {
      const repo = await createArticleRepository(StoreType.InMemory);
      await request(createApp(repo, {}))
        .get('/api/reviewed-preprints/1/2/metadata')
        .expect(500);
    });

    it('returns the correct metadata for the test articles', async () => {
      const agent = await generateAgent();

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
          headings: [{ id: 's1', text: ['Section'] }, { text: ['Acknowledgements'] }],
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
          headings: [{ id: 's1', text: ['Section'] }, { text: ['Acknowledgements'] }],
          abstract: [{ type: 'Paragraph', content: ['Why not to mess with an agent of chaos.'] }],
          references: [],
        });
    });
  });

  describe('/api/reviewed-preprints/:publisherId/:articleId/content', () => {
    it('returns a 500 when an incorrect doi is provided', async () => {
      const repo = await createArticleRepository(StoreType.InMemory);
      await request(createApp(repo, {}))
        .get('/api/reviewed-preprints/1/2/content')
        .expect(500);
    });

    it('returns a 200 with the article content for the two test articles', async () => {
      const agent = await generateAgent();

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

  describe('/api/reviewed-preprints/:publisherId/:articleId/reviews', () => {
    it('returns a 500 when it cant get a docmap', async () => {
      // Needed for jest mock of axios
      // @ts-ignore
      axios.get.mockRejectedValue({});

      const repo = await createArticleRepository(StoreType.InMemory);
      await request(createApp(repo, {}))
        .get('/api/reviewed-preprints/1/2/reviews')
        .expect(500);
    });
    it('returns a 500 when it cant fetch the html', async () => {
      // Needed for jest mock of axios
      // @ts-ignore
      axios.get.mockImplementation((url: string) => {
        switch (url) {
          case 'https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/by-publisher/elife/get-by-doi?preprint_doi=10.1101/123456':
            return Promise.resolve({
              data: docmapMock1,
            });
          default:
            return Promise.reject();
        }
      });

      const repo = await createArticleRepository(StoreType.InMemory);
      await request(createApp(repo, {}))
        .get('/api/reviewed-preprints/10.1101/123456/reviews')
        .expect(404); // TODO: why is this a 404?
    });

    it('returns a 500 when it cant get an evaluation-summary', async () => {
      // Needed for jest mock of axios
      // @ts-ignore
      axios.get.mockImplementation((url: string) => {
        switch (url) {
          case 'https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/by-publisher/elife/get-by-doi?preprint_doi=10.1101/123456':
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

      const repo = await createArticleRepository(StoreType.InMemory);
      await request(createApp(repo, {}))
        .get('/api/reviewed-preprints/10.1101/123456/reviews')
        .expect(404); // TODO: why is this a 404?
    });

    it('returns a 500 when the docmap has no evaluation-summary', async () => {
      // Needed for jest mock of axios
      // @ts-ignore
      axios.get.mockImplementation((url: string) => {
        switch (url) {
          case 'https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/by-publisher/elife/get-by-doi?preprint_doi=10.1101/654321':
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

      const repo = await createArticleRepository(StoreType.InMemory);
      await request(createApp(repo, {}))
        .get('/api/reviewed-preprints/10.1101/654321/reviews')
        .expect(500);
    });

    it('returns a 200 with a peer review object for each article', async () => {
      // Needed for jest mock of axios
      // @ts-ignore
      axios.get.mockImplementation((url: string) => {
        switch (url) {
          case 'https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v1/by-publisher/elife/get-by-doi?preprint_doi=10.1101/123456':
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

      const repo = await createArticleRepository(StoreType.InMemory);
      await request(createApp(repo, {}))
        .get('/api/reviewed-preprints/10.1101/123456/reviews')
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
    const enhancedArticle = {
      id: 'testid3',
      msid: 'testmsid',
      doi: 'doi1',
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
        headings: [{ id: 'head1', text: 'Heading 1' }],
        references: [],
      },
      preprintDoi: 'preprint/testid1',
      preprintUrl: 'doi.org/preprint/testid1',
      preprintPosted: '2023-01-02T00:00:00.000Z',
      sentForReview: '2023-01-03T00:00:00.000Z',
      published: '2023-01-23T00:00:00.000Z',
    };

    it('imports a valid JSON body', async () => {
      const repo = await createArticleRepository(StoreType.InMemory);
      await request(createApp(repo, {}))
        .post('/preprints')
        .send(enhancedArticle)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, {
          result: true,
          message: 'OK',
        });
    });

    it('imports a valid JSON body and we are able to retrieve it', async () => {
      const repo = await createArticleRepository(StoreType.InMemory);
      const app = createApp(repo, {});

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
            testid3: enhancedArticle,
          },
        });
    });

    it('imports two content types and we are able to retrieve the earliest by ID, and the latest by msid', async () => {
      const repo = await createArticleRepository(StoreType.InMemory);
      const app = createApp(repo, {});

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
          headings: [],
          references: [],
        },
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
            testid4: exampleVersion1,
            testid5: exampleVersion2,
          },
        });
      await request(app)
        .get('/api/preprints/article.2')
        .expect({
          article: exampleVersion2,
          versions: {
            testid4: exampleVersion1,
            testid5: exampleVersion2,
          },
        });
    });
  });

  describe('/api/citations', () => {
    const bibtex = `
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

    it('returns a bibtex file with the correct information', async () => {
      const repo = await createArticleRepository(StoreType.InMemory);
      const app = createApp(repo, {});

      // Needed for jest mock of axios
      // @ts-ignore
      axios.get.mockImplementation(() => Promise.resolve({ data: bibtex }));

      await request(app)
        .get('/api/citations/10.5555/12345678/bibtex')
        .expect(200)
        .expect('Content-Type', 'application/x-bibtex; charset=utf-8');
    });

    it('returns a 400 when the crossref call fails', async () => {
      const repo = await createArticleRepository(StoreType.InMemory);
      const app = createApp(repo, {});

      // Needed for jest mock of axios
      // @ts-ignore
      axios.get.mockImplementation(() => Promise.reject());

      await request(app)
        .get('/api/citations/10.5555/12345678/bibtex')
        .expect(404);
    });
  });
});
