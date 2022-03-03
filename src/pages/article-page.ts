import { JSDOM } from 'jsdom';

export const wrapArticleInHtml = (articleHTML: string): string => {
  const articleFragment = JSDOM.fragment(articleHTML);
  const title = getTitle(articleFragment);
  const headings = getHeadings(articleFragment);
  return `
<html lang="en">
  <head>
    <title>${title}</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <link href="https://unpkg.com/@stencila/thema@2/dist/themes/elife/styles.css" rel="stylesheet">
    <script src="https://unpkg.com/@stencila/thema@2/dist/themes/elife/index.js"
      type="text/javascript"></script>
    <script
      src="https://unpkg.com/@stencila/components@&lt;=1/dist/stencila-components/stencila-components.esm.js"
      type="module"></script>
    <script
      src="https://unpkg.com/@stencila/components@&lt;=1/dist/stencila-components/stencila-components.js"
      type="text/javascript" nomodule=""></script>
      <style>
        .toc-container {
          max-width: 69.625rem;
          margin: auto;
          padding-left: 48px;
        }
        .toc-list {
          list-style: none;
          padding-left: 0;
        }
        .toc-list__subheadings {
          list-style: none;          
        }
        .toc-list__item {
          min-width: 150px;
          margin-bottom: 5px;
        }
        .toc-list__link {
          color: #212121;
          font-weight: bold;
          font-family: Noto Sans,Arial,Helvetica,sans-serif;
        }
        .toc-list__link--subheading {
          color: #212121;
          font-family: Noto Sans,Arial,Helvetica,sans-serif;
        }
      </style>
  </head>
  <body>
    <main role="main">
        ${generateToC(headings)}
        ${articleHTML}
    </main>
</body>
</html>
`;
};

const generateToC = (headings: Heading[]): string => {
  return `
    <div class="toc-container">
      <h2>Table of Contents</h2>
      <ul class="toc-list">${headings.map(heading => {
            const subHeadingListItems = heading.children.map(subHeading => `
              <li class="toc-list__item"><a class="toc-list__link--subheading" href="#${subHeading.id}">${subHeading.text}</a></li>
            `);
            const subHeadings = subHeadingListItems.length ? `<ul class="toc-list__subheadings">${subHeadingListItems.join('')}</ul>` : ''
            return `
              <li class="toc-list__item"><a class="toc-list__link" href="#${heading.id}">${heading.text}</a>${subHeadings}</li>
            `
          }).join('')
        }
      </ul>
    </div>
`
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
