export const generateArticleList = (journals: string[], articles: Record<string, string[]>): string => `
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
`;
