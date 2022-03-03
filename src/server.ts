import express from 'express';
import { readdirSync } from "fs";
import { convertJatsToHtml, convertJatsToJSON } from "./conversion/encode";
import { generateArticleList } from "./pages/article-list";
import { wrapArticleInHtml } from "./pages/article-page";

const app = express();

const getDirectories = (source: string) => {
  return readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

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
  const articleHtml = await convertJatsToHtml(journalId, articleId);
  const responseHtml = wrapArticleInHtml(articleHtml)
  res.send(responseHtml);
})

app.listen(3000, () => {
  console.log(`Example app listening on port 3000`)
})
