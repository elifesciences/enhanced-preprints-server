import express from 'express';
import { generateArticleList } from "./article-list/article-list";
import { buildArticlePage } from "./article/article";
import { fetchReviews } from "./reviews/fetch-reviews";
import { generateReviewPage } from "./reviews/reviews";
import { basePage } from "./base-page/base-page";
import { StoreType, createArticleRepository } from './model/model';
import { loadXmlArticlesFromDirIntoStores } from './data-loader/data-loader';
import { createEnhancedArticleGetter } from './reviews/get-enhanced-article';


const app = express();
const cache: Record<string, string> = {};

const config = {
  id: 'https://biophysics.sciencecolab.org',
  name: "Biophysics Colab",
  dataDir: './articles'
}

const articleRepository = createArticleRepository(StoreType.InMemory);
loadXmlArticlesFromDirIntoStores(config.dataDir, articleRepository);
const getEnhancedArticle = createEnhancedArticleGetter(articleRepository, config.id);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send(basePage(generateArticleList(config.name, articleRepository.getArticleSummaries())));
});

app.get('/article/:publisherId/:articleId', async (req, res) => {
  const { publisherId, articleId } = req.params;
  const doi = `${publisherId}/${articleId}`;
  res.send(basePage(buildArticlePage(await getEnhancedArticle(doi))));
});

app.get('/article/:publisherId/:articleId/reviews', async (req, res) => {
  const { publisherId, articleId } = req.params;
  const doi = `${publisherId}/${articleId}`;
  res.send(basePage(generateReviewPage(await getEnhancedArticle(doi))));
});

app.listen(3000, () => {
  console.log(`Example app listening on port 3000`);
});
