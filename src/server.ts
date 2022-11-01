import express from 'express';
import { ArticleRepository } from './model/model';
import { loadXmlArticlesFromDirIntoStores } from './data-loader/data-loader';
import { createArticleRepository } from './model/create-article-repository';
import { config } from './config';
import { logger } from './utils/logger';
import { fetchReviews } from './reviews/fetch-reviews';

const app = express();

let articleRepository: ArticleRepository;
createArticleRepository(config.repoType, config.repoConnection, config.repoUserName, config.repoPassword).then(async (repo: ArticleRepository) => {
  articleRepository = repo;
  app.listen(3000, () => {
    logger.info('Example app listening on port 3000');
  });
});

app.get('/', async (req, res, next) => {
  try {
    res.redirect('/api/reviewed-preprints/');
  } catch (err) {
    next(err);
  }
});

app.get('/api/reviewed-preprints/', async (req, res, next) => {
  try {
    const summaries = await articleRepository.getArticleSummaries();

    res.send({
      items: summaries,
      total: summaries.length,
    });
  } catch (err) {
    next(err);
  }
});

app.get('/api/reviewed-preprints/:publisherId/:articleId/', async (req, res, next) => {
  try {
    const { publisherId, articleId } = req.params;
    const doi = `${publisherId}/${articleId}`;

    res.send(await articleRepository.getArticle(doi));
  } catch (err) {
    next(err);
  }
});

app.get('/api/reviewed-preprints/:publisherId/:articleId/metadata', async (req, res, next) => {
  try {
    const { publisherId, articleId } = req.params;
    const doi = `${publisherId}/${articleId}`;

    const article = await articleRepository.getArticle(doi);
    res.send({
      authors: article.authors,
      doi,
      title: article.title,
      msas: [],
      importance: '',
      strengthOfEvidence: '',
      views: 1,
      citations: 2,
      tweets: 3,
      headings: article.headings,
      abstract: article.abstract,
      references: article.references,
    });
  } catch (err) {
    next(err);
  }
});

app.get('/api/reviewed-preprints/:publisherId/:articleId/content', async (req, res, next) => {
  try {
    const { publisherId, articleId } = req.params;
    const doi = `${publisherId}/${articleId}`;

    const { content } = await articleRepository.getArticle(doi);
    res.send(content);
  } catch (err) {
    next(err);
  }
});

app.get('/api/reviewed-preprints/:publisherId/:articleId/reviews', async (req, res, next) => {
  try {
    const { publisherId, articleId } = req.params;
    const doi = `${publisherId}/${articleId}`;
    res.send(await fetchReviews(doi, config.id));
  } catch (err) {
    next(err);
  }
});

app.get('/import', async (req, res) => {
  res.send(`<form method="POST">
    <input type="submit" value="import">
  </form>`);
});
app.post('/import', async (req, res, next) => {
  try {
    const results = await loadXmlArticlesFromDirIntoStores(config.dataDir, articleRepository);
    if (results.every((value) => value)) {
      res.send({ status: true, message: 'Import completed' });
    } else if (results.every((value) => !value)) {
      res.send({ status: false, message: 'No new files were imported' });
    } else {
      res.send({ status: true, message: 'Some new items imported' });
    }
  } catch (err) {
    next(err);
  }
});

// error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler: express.ErrorRequestHandler = (error, req, res, next) => {
  const status = error.status || 500;
  const message = error.message || 'Something went wrong';
  res.status(status).send({
    status,
    message,
  });
};
app.use(errorHandler);
