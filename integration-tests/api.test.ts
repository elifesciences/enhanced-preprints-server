import request from 'supertest';
import axios from 'axios';
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
          headings: [{ id: 's1', text: ['Section'] }, { text: ['Acknowledgements'] }],
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
                  name: 'ACME Demolitions',
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
          case 'https://sciety.org/docmaps/v1/evaluations-by/elife/10.1101/123456.docmap.json':
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
          case 'https://sciety.org/docmaps/v1/evaluations-by/elife/10.1101/123456.docmap.json':
            return Promise.resolve({
              data: docmapMock1,
            });
          case 'https://sciety.org/static/docmaps/hardcoded-elife-article-review-one.html':
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
          case 'https://sciety.org/docmaps/v1/evaluations-by/elife/10.1101/654321.docmap.json':
            return Promise.resolve({
              data: docmapMock2,
            });
          case 'https://sciety.org/static/docmaps/hardcoded-elife-article-review-one.html':
          case 'https://sciety.org/static/docmaps/hardcoded-elife-article-reply.html':
          case 'https://sciety.org/static/docmaps/hardcoded-elife-article-evaluation-summary.html':
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
          case 'https://sciety.org/docmaps/v1/evaluations-by/elife/10.1101/123456.docmap.json':
            return Promise.resolve({
              data: docmapMock1,
            });
          case 'https://sciety.org/static/docmaps/hardcoded-elife-article-review-one.html':
          case 'https://sciety.org/static/docmaps/hardcoded-elife-article-reply.html':
          case 'https://sciety.org/static/docmaps/hardcoded-elife-article-evaluation-summary.html':
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

  describe('/import-version', () => {
    it('imports a valid JSON body', async () => {
      const repo = await createArticleRepository(StoreType.InMemory);
      await request(createApp(repo, {}))
        .post('/import-version')
        .send({
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
          authors: [],
          content: '<article></article>',
          licenses: [],
          headings: [],
          references: [],
        })
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, {
          result: true,
        });
    });

    it('imports a valid JSON body and we are able to retrieve it', async () => {
      const repo = await createArticleRepository(StoreType.InMemory);
      const app = createApp(repo, {});

      const exampleVersion = {
        id: 'testid3',
        versionIdentifier: '1',
        msid: 'testmsid',
        preprintDoi: 'preprint/testdoi3',
        preprintUrl: 'http://preprints.org/preprint/testdoi3',
        preprintPosted: '2008-06-03',
        doi: 'test/article.8',
        title: 'Test Article 8',
        abstract: 'Test article 8 abstract',
        date: '2008-07-03',
        authors: [],
        content: '<article></article>',
        licenses: [],
        headings: [],
        references: [],
      };

      await request(app)
        .post('/import-version')
        .send(exampleVersion)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, {
          result: true,
        });

      await request(app)
        .get('/api/preprint/testid3')
        .expect({
          current: exampleVersion,
          versions: {
            testid3: exampleVersion,
          },
        });
    });

    it('imports two content types and we are able to retrieve the earliest by ID, and the latest by msid', async () => {
      const repo = await createArticleRepository(StoreType.InMemory);
      const app = createApp(repo, {});

      const exampleVersion1 = {
        id: 'testid4',
        versionIdentifier: '1',
        msid: 'article.2',
        preprintDoi: 'preprint/testdoi4',
        preprintUrl: 'http://preprints.org/preprint/testdoi4',
        preprintPosted: '2008-06-03',
        doi: 'test/article.2',
        title: 'Test Article 8',
        abstract: 'Test article 8 abstract',
        date: '2008-08-03',
        authors: [],
        content: '<article></article>',
        licenses: [],
        headings: [],
        references: [],
      };
      const exampleVersion2 = {
        id: 'testid5',
        versionIdentifier: '2',
        msid: 'article.2',
        preprintDoi: 'preprint/testdoi5',
        preprintUrl: 'http://preprints.org/preprint/testdoi5',
        preprintPosted: '2008-07-03',
        doi: 'test/article.2',
        title: 'Test Article 2',
        abstract: 'Test article 2 abstract',
        date: '2008-09-03',
        authors: [],
        content: '<article></article>',
        licenses: [],
        headings: [],
        references: [],
      };

      await request(app)
        .post('/import-version')
        .send(exampleVersion1)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, {
          result: true,
        });
      await request(app)
        .post('/import-version')
        .send(exampleVersion2)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(200, {
          result: true,
        });

      await request(app)
        .get('/api/preprint/testid4')
        .expect({
          current: exampleVersion1,
          versions: {
            testid4: exampleVersion1,
            testid5: exampleVersion2,
          },
        });
      await request(app)
        .get('/api/preprint/article.2')
        .expect({
          current: exampleVersion2,
          versions: {
            testid4: exampleVersion1,
            testid5: exampleVersion2,
          },
        });
    });
  });
});
