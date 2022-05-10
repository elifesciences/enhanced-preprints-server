import { JSDOM } from 'jsdom';

export const buildArticlePage = (articleHTML: string, doi: string): string => {
  const articleFragment = JSDOM.fragment(articleHTML);
  const articleHtmlWithoutHeader = getArticleHtmlWithoutHeader(articleFragment);
  const headings = getHeadings(articleFragment);
  const header = getHeader(articleFragment);
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
  replaceAttributesWithClassName(articleDom, 'article > [itemprop="headline"]', 'content-header__title');
  replaceAttributesWithClassName(articleDom, '[itemprop="author"]', 'person');
  replaceAttributesWithClassName(articleDom, '[data-itemprop="familyNames"]');
  replaceAttributesWithClassName(articleDom, '[itemprop="familyName"]', 'person__family_name');
  replaceAttributesWithClassName(articleDom, '[data-itemprop="givenNames"]');
  replaceAttributesWithClassName(articleDom, '[itemprop="givenName"]', 'person__given_name');
  replaceAttributesWithClassName(articleDom, 'article > [data-itemprop="authors"]', 'content-header__authors');
  replaceAttributesWithClassName(articleDom, '.person [data-itemprop="affiliations"]', 'person__affiliations');
  replaceAttributesWithClassName(articleDom, '.person [itemprop="affiliation"]');
  replaceAttributesWithClassName(articleDom, 'article > [data-itemprop="affiliations"]', 'content-header__affiliations');
  replaceAttributesWithClassName(articleDom, '.content-header__affiliations > [itemtype="http://schema.org/Organization"]', 'organisation');
  replaceAttributesWithClassName(articleDom, 'article > [data-itemprop="identifiers"]', 'content-header__identifiers');

  const headline = articleDom.querySelector('.content-header__title');
  const authors = articleDom.querySelector('.content-header__authors');
  const affiliations = articleDom.querySelector('.content-header__affiliations');
  const identifiers = articleDom.querySelector('.content-header__identifiers');

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

const replaceAttributesWithClassName = (articleDom:DocumentFragment, selector: string, newClass?: string): void => {
  Array.from(articleDom.querySelectorAll(selector)).forEach(element => {
    element.removeAttribute('itemprop');
    element.removeAttribute('itemtype');
    element.removeAttribute('data-itemprop');
    element.removeAttribute('itemscope');
    if (newClass) {
      element.classList.add(newClass);
    }
  });
}
