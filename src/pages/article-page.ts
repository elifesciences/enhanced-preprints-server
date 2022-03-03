import { JSDOM,  } from 'jsdom';

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
        .toc-list {
          list-style: none;
          max-width: 69.625rem;
          margin: 50px auto auto;
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
      </style>
  </head>
  <body>
    <main role="main">
        <ul class="toc-list">
            ${headings.map(heading => `
              <li class="toc-list__item"><a class="toc-list__link" href="#${heading.id}">${heading.text}</a></li>
            `).join('')}        
        </ul>
        ${articleHTML}
    </main>
</body>
</html>
`;
};

const getTitle = (articleDom: DocumentFragment): string => {
  return articleDom.querySelector('h1')?.getAttribute('content') || '';
}

type Heading = { id: string, text: string };
const getHeadings = (articleDom: DocumentFragment): Heading[] => {
  const headingElements = articleDom.querySelectorAll('article > h2[itemtype="http://schema.stenci.la/Heading"]');
  return Array.from(headingElements).reduce((headings: Heading[], heading) => {
    if (heading.textContent) headings.push({ id: heading.getAttribute('id') || '', text: heading.textContent });
    return headings;
  }, new Array<Heading>());
}
