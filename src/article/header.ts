const replaceAttributesWithClassName = (
  articleDom: DocumentFragment,
  selector: string,
  newClass?: string,
): void => {
  Array.from(articleDom.querySelectorAll(selector)).forEach((element) => {
    element.removeAttribute('itemprop');
    element.removeAttribute('itemtype');
    element.removeAttribute('data-itemprop');
    element.removeAttribute('itemscope');
    if (newClass) {
      element.classList.add(newClass);
    }
  });
};

const getDoi = (articleDom: DocumentFragment): string => {
  const dois = Array.from(articleDom.querySelectorAll('[data-itemprop="identifiers"] [itemtype="http://schema.org/PropertyValue"]'))
    .filter((identifierDom) => identifierDom.querySelector('[itemprop="name"]')?.textContent?.trim() === 'doi').map((identifierDom) => {
      const doi = identifierDom.querySelector('[itemprop="value"]')?.textContent?.trim();
      return `<li class="content-header__identifier"><a href="https://doi.org/${doi}">https://doi.org/${doi}</a></li>`;
    });

  if (dois.length > 1) {
    throw Error(`Found multiple DOIs in manuscript: ${dois.join(',')}`);
  }
  if (dois.length === 0) {
    return '';
  }
  const doi = dois.shift();
  return `<ul class="content-header__identifiers">${doi}</ul>`;
};

export const header = (articleDom: DocumentFragment): string => {
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
  replaceAttributesWithClassName(articleDom, '.organisation > address', 'organisation__address');

  const headline = articleDom.querySelector('.content-header__title');
  const authors = articleDom.querySelector('.content-header__authors');
  const affiliations = articleDom.querySelector('.content-header__affiliations');
  const doi = getDoi(articleDom);

  return `<div class="content-header">
    ${headline?.outerHTML}
    ${authors?.outerHTML}
    ${affiliations?.outerHTML}
    <div class="content-header__footer">
      ${doi}
      <ul class="content-header__icons">
        <li>
          <a href="https://en.wikipedia.org/wiki/Open_access" class="content-header__icon content-header__icon--oa">
            <span class="visuallyhidden">Open access</span>
          </a>
        </li>
        <li>
          <a href="https://creativecommons.org/licenses/by/4.0/" class="content-header__icon content-header__icon--cc">
            <span class="visuallyhidden">Copyright information</span>
          </a>
        </li>
      </ul>
    </div>
  </div>`;
};
