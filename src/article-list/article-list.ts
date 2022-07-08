import { ArticleSummary } from '../model/model';
import { normaliseContentToHtml } from '../model/content';

const dateSort = (a: ArticleSummary, b: ArticleSummary) => {
  if (a.date.getTime() === b.date.getTime()) {
    return 0;
  }
  return a.date.getTime() > b.date.getTime() ? 1 : -1;
};

const wrapInPageHtml = (journalName: string, articleList: string) => `
<div class="articles-page">
  <h1 class="articles-page__title">${journalName} Reviewed Preprints</h1>
  ${articleList}
</div>
`;

const wrapInArticleListHtml = (articleList: string) => `<ul class="articles-list">${articleList}</ul>`;

export const generateArticleList = (journalName: string, articleSummaries: ArticleSummary[]): string => {
  if (articleSummaries.length === 0) {
    return wrapInPageHtml(journalName, '<p>No articles found</p>');
  }

  const articleList = articleSummaries.sort(dateSort).map((articleSummary) => `
    <li><a class="article-list__link" href="/article/${articleSummary.doi}">${articleSummary.date.toLocaleDateString('en-GB')} - ${normaliseContentToHtml(articleSummary.title)}</a></li>
    `).join('');
  return wrapInPageHtml(journalName, wrapInArticleListHtml(articleList));
};
