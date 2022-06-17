import express from 'express';
import { generateArticleList } from './article-list/article-list';
import { articlePage } from './article/article-page';
import { generateReviewPage } from './reviews/reviews';
import { basePage } from './base-page/base-page';
import { ArticleRepository } from './model/model';
import { loadXmlArticlesFromDirIntoStores } from './data-loader/data-loader';
import { createEnhancedArticleGetter, GetEnhancedArticle } from './reviews/get-enhanced-article';
import { createArticleRepository } from './model/create-article-repository';
import { config } from './config';

const app = express();

let articleRepository: ArticleRepository;
let getEnhancedArticle: GetEnhancedArticle;
createArticleRepository(config.repoType, config.repoConnection).then(async (repo: ArticleRepository) => {
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
  const results = await loadXmlArticlesFromDirIntoStores(config.dataDir, articleRepository);
  if (results.every((value) => value === true)) {
    res.send({ status: true, message: 'Import completed' });
  } else {
    res.send({ status: false, message: 'Some files were not imported.' });
  }
});
