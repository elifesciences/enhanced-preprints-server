import { JSDOM } from 'jsdom';
import { EnhancedArticle } from '../model/model';

export const buildArticlePage = (article: EnhancedArticle): string => {
  const articleFragment = JSDOM.fragment(article.html);
  const headings = getHeadings(articleFragment);
  const header = getHeader(articleFragment);
  const articleHtmlWithoutHeader = getArticleHtmlWithoutHeader(articleFragment);
  return `<div class="grid-container">
      ${header}
      <div class="secondary-column">
        <div class="review-link__container">
          <a class="review-link__anchor" href="/article/${article.doi}/reviews">Reviews ></a>
        </div>
      </div>

      <main class="primary-column">
        <div class="table-contents">
          ${generateToC(headings)}
        </div>
        <div class="main-content-area">
          ${articleHtmlWithoutHeader}
        </div>
      </main>
    </div>`;
};

const generateToC = (headings: Heading[]): string => {
  return headings.length ? `
    <div class="toc-container">
      <h2 class="toc-title">Table of Contents</h2>
      <ul class="toc-list">${headings.map(heading => {
            return `
              <li class="toc-list__item"><a class="toc-list__link" href="#${heading.id}">${heading.text}</a></li>
            `
          }).join('')
        }
      </ul>
    </div>
` : '';
}

type HeadingData = { id: string, text: string };
type Heading = { children: HeadingData[] } & HeadingData;
const getHeadings = (articleDom: DocumentFragment): Heading[] => {
  const headingElements = articleDom.querySelectorAll('article > [itemtype="http://schema.stenci.la/Heading"]');

  return Array.from(headingElements).reduce((headings: Heading[], heading) => {
    switch (heading.tagName) {
      case 'H2':
        headings.push({
          id: heading.getAttribute('id') || '',
          text: heading.textContent || '',
          children: new Array<HeadingData>()
        });
        break;
      case 'H3':
        headings[headings.length - 1].children.push({
          id: heading.getAttribute('id') || '',
          text: heading.textContent || ''
        });
        break;
    }
    return headings;
  }, new Array<Heading>());
}

const getHeader = (articleDom: DocumentFragment): string => {
  const headline = articleDom.querySelector('article > [itemprop="headline"]');
  const authors = articleDom.querySelector('article > [data-itemprop="authors"]');
  const affiliations = articleDom.querySelector('article > [data-itemprop="affiliations"]');
  const publisher = articleDom.querySelector('article > [itemprop="publisher"]');
  const datePublished = articleDom.querySelector('article > [itemprop="datePublished"]');
  const identifiers = articleDom.querySelector('article > [data-itemprop="identifiers"]');

  return `<div itemtype="http://schema.org/Article" class="content-header" data-itemscope="root">
    ${headline?.outerHTML}
    ${authors?.outerHTML}
    ${affiliations?.outerHTML}
    ${publisher?.outerHTML}
    ${datePublished?.outerHTML}
    ${identifiers?.outerHTML}
  </div>`;
}

const getArticleHtmlWithoutHeader = (articleDom: DocumentFragment): string => {
  const articleElement = articleDom.children[0];

  const articleHtml = Array.from(articleElement.querySelectorAll('[data-itemprop="identifiers"] ~ *'))
    .reduce((prev, current) => prev.concat(current.outerHTML), '');

  return `<article itemtype="http://schema.org/Article">${articleHtml}</article>`;
}
