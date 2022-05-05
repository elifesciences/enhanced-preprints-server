export const generateArticleList = (journals: string[], articles: Record<string, string[]>): string => `
  <div class="articles-page">
    <h1 class="articles-page__title">Enhanced Preprint Display</h1>
    <div class="journals-list">
      ${journals.map(journal => `
      <h2 class="articles-list__heading">${journal}</h2>
      <ul class="articles-list">
          ${articles[journal].map(article => `<li><a class="article-list__link" href="/article/${journal}/${article}">${article}</a></li>`)}
      </ul>
      `).join('')}
    </div>
  </div>
`;
