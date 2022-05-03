import { JSDOM } from 'jsdom';

export const wrapArticleInHtml = (articleHTML: string, doi: string): string => {
  const articleFragment = JSDOM.fragment(articleHTML);
  const title = getTitle(articleFragment);
  const headings = getHeadings(articleFragment);
  const header = getHeader(articleFragment);
  const articleHtmlWithoutHeader = getArticleHtmlWithoutHeader(articleFragment);
  return `
<html lang="en">
  <head>
    <title>${title}</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link href="https://unpkg.com/@stencila/thema@2/dist/themes/elife/styles.css" rel="stylesheet">
    <link href="https://api.fonts.coollabs.io/css2?family=Noto+Sans" rel="stylesheet"/>
    <link href="https://api.fonts.coollabs.io/css2?family=Noto+Serif" rel="stylesheet"/>
      <link rel="stylesheet" href="/styles.css"/>
  </head>
  <body>
    <div class="grid-container">
      <div class="content-header">
        ${header}
      </div>

      <div class="secondary-column">
        <div class="review-link__container">
          <a class="review-link__anchor" href="/article/${doi}/reviews">Reviews ></a>
        </div>
      </div>

      <main class="primary-column">
        <div class="table-contents">
          ${generateToC(headings)}
        </div>
        <div class="main-content-area">
          ${articleHTML}
        </div>
      </main>
    </div>
</body>
</html>
`.trim();
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

const getTitle = (articleDom: DocumentFragment): string => {
  return articleDom.querySelector('h1')?.getAttribute('content') || '';
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

  return `<div class="header">
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
  console.log(articleElement.outerHTML);

  let articleHtml = "";
  articleElement.querySelectorAll('[data-itemprop="identifiers"] ~ *').forEach((elem) => articleHtml += elem.outerHTML);

  return `<article itemtype="http://schema.org/Article">${articleHtml}</article>`;
}
