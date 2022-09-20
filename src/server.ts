import express from 'express';
import { generateArticleList } from './article-list/article-list';
import { articlePage } from './article/article-page';
import { generateReviewPage } from './reviews/reviews';
import { basePage } from './base-page/base-page';
import { ArticleRepository } from './model/model';
import { loadXmlArticlesFromDirIntoStores } from './data-loader/data-loader';
import { createEnhancedArticleGetter, GetEnhancedArticle } from './reviews/get-enhanced-article';
import { createArticleRepository, StoreType } from './model/create-article-repository';
import { config } from './config';
import { logger } from './utils/logger';
import { fetchReviews } from './reviews/fetch-reviews';

const app = express();

let articleRepository: ArticleRepository;
let getEnhancedArticle: GetEnhancedArticle;
createArticleRepository(config.repoType, config.repoConnection, config.repoUserName, config.repoPassword).then(async (repo: ArticleRepository) => {
  articleRepository = repo;
  getEnhancedArticle = createEnhancedArticleGetter(articleRepository, config.id);
  app.listen(3000, () => {
    logger.info('Example app listening on port 3000');
  });
});

app.use(express.static('public'));

app.get('/', async (req, res, next) => {
  try {
    res.send(basePage(generateArticleList(config.name, await articleRepository.getArticleSummaries())));
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

app.get('/article/:publisherId/:articleId', async (req, res, next) => {
  try {
    const { publisherId, articleId } = req.params;
    const doi = `${publisherId}/${articleId}`;
    const noHeader = req.query.noHeader !== undefined && req.query.noHeader === 'true';
    const pageContent = articlePage(await articleRepository.getArticle(doi), noHeader);
    res.send(basePage(pageContent, noHeader));
  } catch (err) {
    next(err);
  }
});

app.get('/article/:publisherId/:articleId/reviews', async (req, res, next) => {
  try {
    const { publisherId, articleId } = req.params;
    const doi = `${publisherId}/${articleId}`;
    const noHeader = req.query.noHeader !== undefined && req.query.noHeader === 'true';
    const pageContent = generateReviewPage(await getEnhancedArticle(doi), noHeader);
    res.send(basePage(pageContent, noHeader));
  } catch (err) {
    next(err);
  }
});

app.get('/article/:publisherId/:articleId/attachment/:attachmentId', async (req, res, next) => {
  try {
    const { publisherId, articleId } = req.params;
    const doi = `${publisherId}/${articleId}`;
    const { attachmentId } = req.params;

    if (req.accepts('image/jpeg')) {
      const iiifId = encodeURIComponent(`${doi}/${attachmentId}`);

      res.redirect(`${config.iiifServer}/iiif/2/${iiifId}/full/max/0/default.jpg`);
      return;
    }

    logger.error('Something requested an attachment, but it didnt accept jpegs. Send 404 as we currently cant find it');
    res.sendStatus(415);
  } catch (err) {
    next(err);
  }
});

app.get('/article/:publisherId/:articleId/iiif/:attachmentId', async (req, res, next) => {
  try {
    const { publisherId, articleId } = req.params;
    const doi = `${publisherId}/${articleId}`;
    const { attachmentId } = req.params;

    const iiifId = encodeURIComponent(`${doi}/${attachmentId}`);

    res.redirect(`${config.iiifServer}/iiif/2/${iiifId}`);
  } catch (err) {
    next(err);
  }
});

app.get('/import', async (req, res) => {
  res.send(basePage(`<form method="POST">
    <input type="submit" value="import">
  </form>`));
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
const errorHandler: express.ErrorRequestHandler = (error, req, res, _: express.NextFunction) => {
  const status = error.status || 500;
  const message = error.message || 'Something went wrong';
  console.log(res);
  res.sendStatus(status);
  res.send({
    status,
    message,
  });
};
app.use(errorHandler);
