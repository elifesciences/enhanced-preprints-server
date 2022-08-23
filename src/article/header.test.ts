/**
 * @jest-environment jsdom
 */
import { within } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { Author } from '../model/model';
import { header } from './header';

const generateAuthor = (surnameSuffix: string, affiliationSuffix: string): Author => (
  { givenNames: ['Reece'], familyNames: [`Urcher ${surnameSuffix}`], affiliations: [{ name: `Department of Neuroscience, The University of Texas at Austin ${affiliationSuffix}` }] }
);

const exampleArticle = {
  doi: '12.345/67890213445',
  xml: '',
  html: '',
  document: '',
  title: 'Article',
  abstract: '',
  date: new Date('2022-06-05'),
  authors: [
    generateAuthor('1', ''),
  ],
  licenses: [],
  content: '',
  headings: [],
};

describe('header', () => {
  describe('text extraction', () => {
    document.body.innerHTML = header(exampleArticle);

    it('returns a title', () => {
      const title = document.querySelector<HTMLHeadingElement>('h1');
      if (!title) {
        fail('no title present');
      }

      expect(within(title).getByText('Article')).toBeInTheDocument();
    });

    it('returns the authors', () => {
      const authors = document.querySelector<HTMLOListElement>('.content-header__authors > ol');
      if (!authors) {
        fail('no authors present');
      }

      expect(within(authors).getByText('Reece Urcher 1', { exact: false })).toBeInTheDocument();
    });

    it('returns the affiliations', () => {
      const affiliations = document.querySelector<HTMLOListElement>('.content-header__affiliations');
      if (!affiliations) {
        fail('no affiliations present');
      }

      expect(within(affiliations).getByText('Department of Neuroscience, The University of Texas at Austin', { exact: false })).toBeInTheDocument();
    });

    it('returns the affiliations summary', () => {
      const affiliations = document.querySelector<HTMLOListElement>('.content-header__affiliations');
      if (!affiliations) {
        fail('no affiliations present');
      }

      expect(within(affiliations).getByText('Department of Neuroscience, The University of Texas at Austin', { exact: false })).toBeInTheDocument();
    });

    it('returns the identifiers', () => {
      const identifiers = document.querySelector<HTMLUListElement>('.content-header__identifiers');
      if (!identifiers) {
        fail('no identifiers present');
      }

      expect(within(identifiers).getByText('https://doi.org/12.345/67890213445', { exact: false })).toBeInTheDocument();
    });
  });
});
