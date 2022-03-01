import express from 'express';
import { convert } from '@stencila/encoda';
import { readdirSync } from "fs";

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
    readdirSync(`./data/${journal}`).forEach(articleDir => articles[journal].push(articleDir)) //reuse getDirectories
  })
  res.send(`
<html lang="en">
  <head>
    <title>Enhanced Preprint</title>
    <style>
        body {
            font-family: "Roboto Light", sans-serif;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            grid-template-rows: min-content auto;
        }
        ul {
            list-style: none;
        }
        .articles-list {
            margin-top: 50px;
            grid-column: 2;
        }
        h1 {
            grid-column: 1/4;
            margin-bottom: 0;
            text-align: center;
            height: fit-content;
            color: rgb(33,33,33);
        }
        h2 {
            color: rgb(33,33,33);
        }
    </style>
  </head>
  <body>
    <h1>Enhanced Preprint Display</h1>
    <div class="articles-list">
      ${journals.map(journal => `
      <h2>${journal}</h2>
      <ul>
          ${articles[journal].map(article => `<li><a href="/article/${journal}/${article}">${article}</a></li>`)}
      </ul>
      `).join('')}
    </div>
  </body>
</html>
`)
});

app.get('/article/:journalId/:articleId', async (req, res) => {
  const journalId = req.params.journalId;
  const articleId = req.params.articleId;
  const jsonReq = req.query.json === 'true';
  const response = await convert(`data/${journalId}/${articleId}/${articleId}.xml`, undefined, {
    from: 'jats',
    to: jsonReq ? 'json' : 'html',
    encodeOptions: {
      theme: 'elife',
      isStandalone: true,
      isBundle: true,
    }
  });
  res.send(response);
})

app.listen(3000, () => {
  console.log(`Example app listening on port 3000`)
})
