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
                doi: '10.1101/2021.11.17.469032',
                title: 'Anatomical connectivity along the anterior-posterior axis of the\n'
                  + '                    human hippocampus: new insights using quantitative fibre-tracking\n'
                  + '                ',
                date: '2021-11-19T00:00:00.000Z',
              },
              {
                doi: '10.1101/2021.12.08.471796',
                title: [{ type: 'Emphasis', content: ['Drosophila'] }, '\n                    gustatory projections are segregated by taste modality and connectivity\n                '],
                date: '2021-12-09T00:00:00.000Z',
              },
              {
                doi: '10.1101/2022.03.15.484463',
                title: 'Timely sleep coupling: spindle-slow wave synchrony is linked to\n'
                  + '                    early amyloid-β burden and predicts memory decline\n'
                  + '                ',
                date: '2022-03-19T00:00:00.000Z',
              },
              {
                doi: '10.1101/2022.04.13.488149',
                title: 'A pulse-chasable reporter processing assay for mammalian\n'
                  + '                    autophagic flux with HaloTag\n'
                  + '                ',
                date: '2022-04-13T00:00:00.000Z',
              },
            ],
            total: 4,
          });
      });
    });
  });
});
