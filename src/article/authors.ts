import { replaceAttributesWithClassName } from '../utils/utils';

export const authors = (articleDom: DocumentFragment): HTMLElement | null => {
  replaceAttributesWithClassName(articleDom, '[itemprop="author"]', 'person');
  replaceAttributesWithClassName(articleDom, '[data-itemprop="familyNames"]');
  replaceAttributesWithClassName(articleDom, '[itemprop="familyName"]', 'person__family_name');
  replaceAttributesWithClassName(articleDom, '[data-itemprop="givenNames"]');
  replaceAttributesWithClassName(articleDom, '[itemprop="givenName"]', 'person__given_name');
  replaceAttributesWithClassName(articleDom, 'article > [data-itemprop="authors"]', 'content-header__authors');

  return articleDom.querySelector('.content-header__authors');
};
