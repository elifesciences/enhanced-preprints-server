import { JSDOM } from 'jsdom';
import { ProcessedArticle } from '../model/model';
import { jumpToMenu } from './jump-menu';
import { header } from './header';
import { articleFurniture } from './article-furniture';
import { evaluationSummary } from './article-evaluation-summary';

const getArticleHtmlWithoutHeader = (articleDom: DocumentFragment): string => {
  const articleElement = articleDom.children[0];

  const articleHtml = Array.from(articleElement.querySelectorAll('[data-itemprop="identifiers"] ~ *'))
    .reduce((prev, current) => prev.concat(current.outerHTML), '');

  return `<article itemtype="http://schema.org/Article">${articleHtml}</article>`;
};

export const articlePage = (article: ProcessedArticle, noHeader: boolean): string => {
  const articleFragment = JSDOM.fragment(article.html);
  const abstractHeading = articleFragment.querySelector('article > [data-itemprop="description"] > h2[data-itemtype="http://schema.stenci.la/Heading"]');
  abstractHeading?.setAttribute('id', 'abstract');
  const articleHtmlWithoutHeader = getArticleHtmlWithoutHeader(articleFragment);

  return `${header(articleFragment)}
      <main class="primary-column">
        <div class="table-contents">
          ${jumpToMenu(articleFragment)}
        </div>
        <div class="main-content-area">
          <div class="article-body">
            ${evaluationSummary(article.doi)}
            ${articleHtmlWithoutHeader}
          </div>
        </div>
      </main>

      <div class="secondary-column">
        ${articleFurniture(article.doi, noHeader)}
      </div>`;
};
