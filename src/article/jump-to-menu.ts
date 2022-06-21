type Heading = { id: string, text: string };
const getHeadings = (articleDom: DocumentFragment): Heading[] => {
  const headingElements = articleDom.querySelectorAll('article > h2[itemtype="http://schema.stenci.la/Heading"]');
  if (headingElements.length === 0) { // don't add abstract if there are no headings found.
    return [];
  }
  return Array.from(headingElements).reduce((headings: Heading[], heading) => {
    if (heading.tagName === 'H2') {
      headings.push({
        id: heading.getAttribute('id') || '',
        text: heading.textContent || '',
      });
    }
    return headings;
  }, new Array<Heading>({ id: 'abstract', text: 'Abstract' }));
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
