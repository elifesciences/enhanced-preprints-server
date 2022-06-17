type Heading = { id: string, text: string };
const getHeadings = (articleDom: DocumentFragment): Heading[] => {
  const headingElements = articleDom.querySelectorAll('article > [itemtype="http://schema.stenci.la/Heading"], article > [data-itemprop="description"] > [data-itemtype="http://schema.stenci.la/Heading"]');

  return Array.from(headingElements).reduce((headings: Heading[], heading) => {
    if (heading.tagName === 'H2') {
      headings.push({
        id: heading.getAttribute('id') || '',
        text: heading.textContent || '',
      });
    }
    return headings;
  }, new Array<Heading>());
};

export const jumpToMenu = (articleFragment: DocumentFragment): string => {
  const headings = getHeadings(articleFragment);
  return (headings.length ? `
      <div class="toc-container">
        <ul class="toc-list">
        <li class="toc-list__item"><a class="toc-list__link" href="#evaluation-summary">eLife review summary</a></li>
          ${headings.map((heading) => `
                <li class="toc-list__item"><a class="toc-list__link" href="#${heading.id}">${heading.text}</a></li>
              `).join('')
    }
        </ul>
      </div>
  ` : '');
};
