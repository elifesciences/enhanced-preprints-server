import express from 'express';
import { readdirSync } from "fs";
import { convertToHtml } from "./conversion/encode";
import { generateArticleList } from "./pages/article-list";

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
  const jsonReq = req.query.json === 'true';
  const response = await convertToHtml(journalId, articleId, jsonReq);
  res.send(response);
})

app.listen(3000, () => {
  console.log(`Example app listening on port 3000`)
})
