import { ArticleSummary } from "../model/model";

export const generateArticleList = (journalName: string, articleSummaries: ArticleSummary[]): string => {
  if (articleSummaries.length == 0) {
    return wrapInPageHtml(journalName, '<p>No articles found</p>');
  }

  const articleList = articleSummaries.map(articleSummary => `
    <li><a class="article-list__link" href="/article/${articleSummary.doi}">${articleSummary.date.toLocaleDateString()} - ${articleSummary.title}</a></li>
    `).join('');
  return wrapInPageHtml(journalName, wrapInArticleListHtml(articleList));
}

const wrapInArticleListHtml = (articleList: string) => `<ul class="articles-list">${articleList}</ul>`;

const wrapInPageHtml = (journalName: string, articleList: string) => `
<div class="articles-page">
  <h1 class="articles-page__title">${journalName} Reviewed Preprints</h1>
  ${articleList}
</div>
`;
