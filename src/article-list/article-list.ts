import { ArticleSummary } from "../model/model";

export const generateArticleList = (journalName: string, articleSummaries: ArticleSummary[]): string => `
  <div class="articles-page">
    <h1 class="articles-page__title">Enhanced Preprint Display</h1>
    <div class="journals-list">
      <h2 class="articles-list__heading">${journalName}</h2>
      <ul class="articles-list">
      ${articleSummaries.map(articleSummary => `
      <li><a class="article-list__link" href="/article/${articleSummary.doi}">${articleSummary.title}</a></li>
      `).join('')}
      </ul>
    </div>
  </div>
`;
