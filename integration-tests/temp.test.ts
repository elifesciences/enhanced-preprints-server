import { Express } from 'express-serve-static-core';
import request from 'supertest';
import { createApp } from '../src/app';
import { createArticleRepository, StoreType } from '../src/model/create-article-repository';

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
      let app: Express;
      beforeAll(async () => {
        const repo = await createArticleRepository(StoreType.InMemory);
        app = await createApp(repo, { dataDir: './integration-tests/data/10.1101' });

        return request(app)
          .post('/import')
          .expect(200);
      }, 30000);

      it('should return a json array with the correct summaries', async () => {
        await request(app)
          .get('/api/reviewed-preprints')
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
      const repo = await createArticleRepository(StoreType.InMemory);
      const app = await createApp(repo, { dataDir: './integration-tests/data/10.1101' });

      const agent = request(app);

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
});
