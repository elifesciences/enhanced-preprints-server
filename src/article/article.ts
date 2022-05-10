import { JSDOM } from 'jsdom';

export const buildArticlePage = (articleHTML: string, doi: string): string => {
  const articleFragment = JSDOM.fragment(articleHTML);
  const headings = getHeadings(articleFragment);
  const header = getHeader(articleFragment);
  const articleHtmlWithoutHeader = getArticleHtmlWithoutHeader(articleFragment);
  return `<div class="grid-container">
      ${header}
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
          ${articleHtmlWithoutHeader}
        </div>
      </main>
    </div>`;
};

const generateToC = (headings: Heading[]): string => {
  return headings.length ? `
    <div class="toc-container">
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
  const identifiers = articleDom.querySelector('article > [data-itemprop="identifiers"]');

  authors?.removeAttribute('data-itemprop');
  authors?.classList.add('content-header__authors');

  if (authors) {
    Array.from(authors.querySelectorAll('[itemprop="author"]')).forEach(personElement => {
      personElement.removeAttribute('itemprop');
      personElement.removeAttribute('itemtype');
      personElement.classList.add('person');
    });
  }

  affiliations?.removeAttribute('data-itemprop');
  affiliations?.classList.add('content-header__affiliations');

  return `<div class="content-header">
    ${headline?.outerHTML}
    ${authors?.outerHTML}
    ${affiliations?.outerHTML}
    ${identifiers?.outerHTML}
  </div>`;
}

const getArticleHtmlWithoutHeader = (articleDom: DocumentFragment): string => {
  const articleElement = articleDom.children[0];

  const articleHtml = Array.from(articleElement.querySelectorAll('[data-itemprop="identifiers"] ~ *'))
    .reduce((prev, current) => prev.concat(current.outerHTML), '');

  return `<article itemtype="http://schema.org/Article">${articleHtml}</article>`;
}
