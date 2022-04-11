export const generateArticleList = (journals: string[], articles: Record<string, string[]>): string => `
<html lang="en">
  <head>
    <title>Enhanced Preprint</title>
    <link href="https://api.fonts.coollabs.io/css2?family=Noto+Sans" rel="stylesheet"/>
    <link rel="stylesheet" href="/styles.css"/>
  </head>
  <body>
    <div class="articles-page">
      <h1 class="articles-page__title">Enhanced Preprint Display</h1>
      <div class="articles-list">
        ${journals.map(journal => `
        <h2 class="articles-list__heading">${journal}</h2>
        <ul>
            ${articles[journal].map(article => `<li><a class="article-list__link" href="/article/${journal}/${article}">${article}</a></li>`)}
        </ul>
        `).join('')}
      </div>
    </div>
  </body>
</html>
`;
