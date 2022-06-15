import express from 'express';
import { generateArticleList } from './article-list/article-list';
import { articlePage } from './article/article-page';
import { generateReviewPage } from './reviews/reviews';
import { basePage } from './base-page/base-page';
import { ArticleRepository } from './model/model';
import { loadXmlArticlesFromDirIntoStores } from './data-loader/data-loader';
import { createEnhancedArticleGetter, GetEnhancedArticle } from './reviews/get-enhanced-article';
import { createArticleRepository, StoreType } from './model/create-article-repository';

const app = express();

const config = {
  id: process.env.EPP_REVIEWGROUP_ID ?? 'https://elifesciences.org',
  name: process.env.EPP_REVIEWGROUP_NAME ?? 'eLife',
  dataDir: process.env.EPP_ARTICLE_DIR_PATH ?? './data/10.1101',
  databasePath: process.env.EPP_DATABASE_PATH ?? './data.db',
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
  res.send(basePage(articlePage(await articleRepository.getArticle(doi))));
});

app.get('/article/:publisherId/:articleId/reviews', async (req, res) => {
  const { publisherId, articleId } = req.params;
  const doi = `${publisherId}/${articleId}`;
  res.send(basePage(generateReviewPage(await getEnhancedArticle(doi))));
});
