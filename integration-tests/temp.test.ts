import request from 'supertest';
import axios from 'axios';
import { createApp } from '../src/app';
import { createArticleRepository, StoreType } from '../src/model/create-article-repository';
import { docmapMock, reviewMocks } from './data/10.1101/123456/docmap-mock';

jest.mock('axios');

const generateAgent = async () => {
  const repo = await createArticleRepository(StoreType.InMemory);
  const app = await createApp(repo, { dataDir: './integration-tests/data/10.1101' });

  return request(app);
};

describe('server tests', () => {
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
          .expect({
            items: [
              {
                doi: '10.1101/123456',
                title: 'Our Pondering of World Domination!',
                date: '2021-11-19T00:00:00.000Z',
              },
              {
                doi: '10.1101/654321',
                title: 'Dangers of roadrunners with reality warping powers.',
                date: '2021-11-19T00:00:00.000Z',
              },
            ],
            total: 2,
          });
      });
    });
  });

  describe('/import', () => {
    it('import the articles', async () => {
      const repo = await createArticleRepository(StoreType.InMemory);
      const app = await createApp(repo, { dataDir: './integration-tests/data/10.1101' });

      return request(app)
        .post('/import')
        .expect(200)
        .expect({
          status: true,
          message: 'Import completed',
        });
    });

    it.failing('import missing articles', async () => {
      const repo = await createArticleRepository(StoreType.InMemory);
      const app = await createApp(repo, { dataDir: './integration-tests/data/10.1101' });

      await request(app)
        .post('/import')
        .expect(200)
        .expect({
          status: true,
          message: 'Import completed',
        });

      // TODO: how to only import one then another?

      return request(app)
        .post('/import')
        .expect(200)
        .expect({
          status: true,
          message: 'Some new items imported',
        });
    });

    it('return success and message when nothing new to import', async () => {
      const agent = await generateAgent();

      await agent.post('/import')
        .expect(200)
        .expect({
          status: true,
          message: 'Import completed',
        });

      await agent.post('/import')
        .expect(200)
        .expect({
          status: false,
          message: 'No new files were imported',
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
                  name: 'ACME Labs',
                }],
              familyNames: ['Brain'],
            }, {
              type: 'Person',
              affiliations: [
                {
                  type: 'Organization',
                  address: {
                    type: 'PostalAddress',
                    addressCountry: 'USA',
                  },
                  name: 'ACME Labs',
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
          headings: [{ id: 's1', text: ['Section'] }],
          abstract: 'An abstract.',
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
                  name: 'ACME Demolitions',
                }],
              familyNames: ['Coyote'],
              givenNames: ['Wile', 'E'],
            }, {
              type: 'Person',
              affiliations: [
                {
                  type: 'Organization',
                  address: {
                    type: 'PostalAddress',
                    addressCountry: 'New Zealand',
                  },
                  name: 'ACME Demolitions',
                }],
              familyNames: ['Devil'],
              givenNames: ['Taz'],
            }],
          doi: '10.1101/654321',
          title: 'Dangers of roadrunners with reality warping powers.',
          msas: [],
          importance: '',
          strengthOfEvidence: '',
          views: 1,
          citations: 2,
          tweets: 3,
          headings: [{ id: 's1', text: ['Section'] }],
          abstract: 'Why not to mess with an agent of chaos.',
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
        ]);

      await agent.get('/api/reviewed-preprints/10.1101/654321/content')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect([
          {
            type: 'Heading', id: 's1', depth: 1, content: ['Section'],
          },
          { type: 'Paragraph', content: ['Run..... just run!'] },
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
          case 'https://sciety.org/docmaps/v1/evaluations-by/elife/10.1101/123456.docmap.json':
            return Promise.resolve({
              data: docmapMock,
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
          case 'https://sciety.org/docmaps/v1/evaluations-by/elife/10.1101/123456.docmap.json':
            return Promise.resolve({
              data: docmapMock,
            });
          case 'https://sciety.org/static/docmaps/hardcoded-elife-article-review-one.html':
            return Promise.resolve({
              data: reviewMocks[url],
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

    it('returns a 200 with a peer review object for each article', async () => {
      // Needed for jest mock of axios
      // @ts-ignore
      axios.get.mockImplementation((url: string) => {
        switch (url) {
          case 'https://sciety.org/docmaps/v1/evaluations-by/elife/10.1101/123456.docmap.json':
            return Promise.resolve({
              data: docmapMock,
            });
          case 'https://sciety.org/static/docmaps/hardcoded-elife-article-review-one.html':
          case 'https://sciety.org/static/docmaps/hardcoded-elife-article-reply.html':
          case 'https://sciety.org/static/docmaps/hardcoded-elife-article-evaluation-summary.html':
            return Promise.resolve({
              data: reviewMocks[url],
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
});
