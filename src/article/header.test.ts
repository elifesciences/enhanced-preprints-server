import { JSDOM } from 'jsdom';
import { header } from './header';

const exampleArticle = {
  doi: '12.345/67890213445',
  xml: '',
  html: '',
  document: '',
  title: 'Article',
  abstract: '',
  date: new Date('2022-06-05'),
  authors: [
    { givenNames: ['Reece'], familyNames: ['Urcher 1'], affiliations: [{ name: 'Department of Neuroscience, The University of Texas at Austin' }] },
  ],
  licenses: [],
  content: '',
  headings: [],
};

describe('header', () => {
  describe('text extraction', () => {
    const result = JSDOM.fragment(header(exampleArticle));

    it('returns a title', () => {
      expect(result.querySelector('.content-header__title')?.textContent).toBe('Article');
    });

    it('returns the authors', () => {
      expect(result.querySelector('.content-header__authors')?.textContent?.replaceAll(/[\s]{2,}/g, ' ').trim()).toBe('Reece Urcher 1');
    });

    it('returns the affiliations', () => {
      expect(result.querySelector('.content-header__affiliations')?.textContent?.replaceAll(/[\s]{2,}/g, ' ').trim()).toBe('Department of Neuroscience, The University of Texas at Austin');
    });

    it('returns the identifiers', () => {
      expect(result.querySelector('.content-header__identifiers')?.textContent?.replaceAll(/[\s]{2,}/g, ' ').trim()).toBe('https://doi.org/12.345/67890213445');
    });
  });
});
