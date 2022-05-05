import express from 'express';
import { readdirSync } from "fs";
import { convertJatsToHtml } from "./conversion/encode";
import { generateArticleList } from "./article-list/article-list";
import { wrapArticleInHtml } from "./article/article";
import { fetchReviews } from "./reviews/fetch-reviews";
import { generateReviewPage } from "./reviews/reviews";


const app = express();
const cache: Record<string, string> = {};

const getDirectories = (source: string) => {
  return readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

app.use(express.static('public'));

app.get('/', (req, res) => {
  const articles: Record<string, Array<string>> = {};
  const journals = getDirectories('./data');
  journals.forEach(journal => articles[journal] = []);
  journals.forEach(journal => {
    getDirectories(`./data/${journal}`).forEach(articleDir => articles[journal].push(articleDir))
  })
  res.send(generateArticleList(journals, articles));
});

app.get('/article/:journalId/:articleId', async (req, res) => {
  const journalId = req.params.journalId;
  const articleId = req.params.articleId;
  let articleHtml = cache[`${journalId}:${articleId}`];
  if (!articleHtml) {
    articleHtml = await convertJatsToHtml(journalId, articleId);
    cache[`${journalId}:${articleId}`] = articleHtml;
  }
  const responseHtml = wrapArticleInHtml(articleHtml, `${journalId}/${articleId}`);
  res.send(responseHtml);
});

app.get('/article/:journalId/:articleId/reviews', async (req, res) => {
  const { journalId, articleId } = req.params;
  const doi = `${journalId}/${articleId}`;
  const reviews = await fetchReviews(doi, 'https://biophysics.sciencecolab.org');
  res.send(generateReviewPage(reviews, doi));
});

app.listen(3000, () => {
  console.log(`Example app listening on port 3000`);
});
