import { JSDOM } from 'jsdom';
import { ProcessedArticle } from '../model/model';
import { jumpToMenu } from './jump-to-menu';
import { header } from './header';
import { articleFurniture } from './article-furniture';

const getArticleHtmlWithoutHeader = (articleDom: DocumentFragment): string => {
  const articleElement = articleDom.children[0];

  const articleHtml = Array.from(articleElement.querySelectorAll('[data-itemprop="identifiers"] ~ *'))
    .reduce((prev, current) => prev.concat(current.outerHTML), '');

  return `<article itemtype="http://schema.org/Article">${articleHtml}</article>`;
};

export const articlePage = (article: ProcessedArticle): string => {
  const articleFragment = JSDOM.fragment(article.html);
  const articleHtmlWithoutHeader = getArticleHtmlWithoutHeader(articleFragment);

  return `${header(articleFragment)}
      <div class="secondary-column">
        ${articleFurniture(article.doi)}
      </div>

      <main class="primary-column">
        <div class="table-contents">
          ${jumpToMenu(articleFragment)}
        </div>
        <div class="main-content-area">
          ${articleHtmlWithoutHeader}
        </div>
      </main>`;
};
