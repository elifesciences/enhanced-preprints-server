import { Express } from 'express-serve-static-core';
import request from 'supertest';
import { createApp } from '../src/app';
import { createArticleRepository, StoreType } from '../src/model/create-article-repository';

describe('server tests', () => {
  describe('/api/reviewed-preprints', () => {
    describe('empty database', () => {
      it('should redirect from / to /api/reviewed-preprints/', async () => {
        const repo = await createArticleRepository(StoreType.InMemory);
        await request(createApp(repo))
          .get('/')
          .expect(302)
          .expect('Location', '/api/reviewed-preprints/');
      });

      it('should return an empty json array with no data', async () => {
        const repo = await createArticleRepository(StoreType.InMemory);
        await request(createApp(repo))
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
        app = await createApp(repo);

        return request(app).post('/import').expect(200);
      }, 30000);

      it('should return a json array with the correct summaries', async () => {
        await request(app)
          .get('/api/reviewed-preprints')
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect({
            items: [],
            total: 7,
          });
      });
    });
  });
});
