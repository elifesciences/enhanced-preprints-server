import express from 'express';
import { exit } from 'process';
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
  id: process.env.REVIEWGROUP_ID ?? 'https://elifesciences.org',
  name: process.env.REVIEWGROUP_NAME ?? 'eLife',
  dataDir: process.env.IMPORT_DIR_PATH ?? './data/10.1101',
  repoType: process.env.REPO_TYPE ?? 'Sqlite',
  repoConnection: process.env.REPO_CONNECTION ?? './data.db',
};

let repositoryType: StoreType;
if (config.repoType === 'Sqlite') {
  repositoryType = StoreType.Sqlite;
} else if (config.repoType === 'InMemory') {
  repositoryType = StoreType.InMemory;
} else {
  // eslint-disable-next-line no-console
  console.log(`Cannot find article repository type of ${config.repoType}`);
  exit(1);
}

let articleRepository: ArticleRepository;
let getEnhancedArticle: GetEnhancedArticle;
createArticleRepository(repositoryType, config.repoConnection).then(async (repo: ArticleRepository) => {
  articleRepository = repo;
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

app.get('/import', async (req, res) => {
  await loadXmlArticlesFromDirIntoStores(config.dataDir, articleRepository);
  res.send({ status: true, message: 'Import completed' });
});
