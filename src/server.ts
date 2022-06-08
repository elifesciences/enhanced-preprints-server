import express from 'express';
import { generateArticleList } from './article-list/article-list';
import { buildArticlePage } from './article/article';
import { generateReviewPage } from './reviews/reviews';
import { basePage } from './base-page/base-page';
import { StoreType, createArticleRepository, ArticleRepository } from './model/model';
import { loadXmlArticlesFromDirIntoStores } from './data-loader/data-loader';
import { createEnhancedArticleGetter, GetEnhancedArticle } from './reviews/get-enhanced-article';

const app = express();

const config = {
  id: 'https://elifesciences.org',
  name: 'eLife',
  dataDir: './data/10.1101',
  databasePath: './data.db',
};

let articleRepository: ArticleRepository;
let getEnhancedArticle: GetEnhancedArticle;
createArticleRepository(StoreType.Sqlite, config.databasePath).then(async (repo: ArticleRepository) => {
  articleRepository = repo;
  await loadXmlArticlesFromDirIntoStores(config.dataDir, articleRepository);
  getEnhancedArticle = createEnhancedArticleGetter(articleRepository, config.id);
  app.listen(3000, () => {
    // eslint-disable-next-line no-console
    console.log('Example app listening on port 3000');
  });
});

app.use(express.static('public'));

app.get('/', async (req, res) => {
  res.send(basePage(generateArticleList(config.name, await articleRepository.getArticleSummaries())));
});

app.get('/article/:publisherId/:articleId', async (req, res) => {
  const { publisherId, articleId } = req.params;
  const doi = `${publisherId}/${articleId}`;
  res.send(basePage(buildArticlePage(await articleRepository.getArticle(doi))));
});

app.get('/article/:publisherId/:articleId/reviews', async (req, res) => {
  const { publisherId, articleId } = req.params;
  const doi = `${publisherId}/${articleId}`;
  res.send(basePage(generateReviewPage(await getEnhancedArticle(doi))));
});
