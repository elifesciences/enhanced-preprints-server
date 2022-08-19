/**
 * @jest-environment jsdom
 */
import { within } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { Author } from '../model/model';
import { header } from './header';

const generateAuthor = (surnameSuffix: string, affiliationSuffix: string): Author => ({ givenNames: ['Reece'], familyNames: [`Urcher ${surnameSuffix}`], affiliations: [{ name: `Department of Neuroscience, The University of Texas at Austin ${affiliationSuffix}` }] });

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

const exampleArticleWith2AuthorsAnd2Affiliations = {
  doi: '12.345/67890213445',
  xml: '',
  html: '',
  document: '',
  title: 'Article',
  abstract: '',
  date: new Date('2022-06-05'),
  authors: [
    generateAuthor('1', '1'),
    generateAuthor('2', '2'),
  ],
  licenses: [],
  content: '',
  headings: [],
};

const exampleArticleWith4Authors3Affiliations = {
  doi: '12.345/67890213445',
  xml: '',
  html: '',
  document: '',
  title: 'Article',
  abstract: '',
  date: new Date('2022-06-05'),
  authors: [
    generateAuthor('1', '1'),
    generateAuthor('2', '2'),
    generateAuthor('3', '1'),
    generateAuthor('4', '3'),
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

    it('returns the author summary', () => {
      const authors = document.querySelector<HTMLOListElement>('.content-header__authors > summary');
      if (!authors) {
        fail('no authors present');
      }

      expect(within(authors).getByText('Reece Urcher 1', { exact: false })).toBeInTheDocument();
    });

    it('returns the affiliations', () => {
      const affiliations = document.querySelector<HTMLOListElement>('.content-header__affiliations > ol');
      if (!affiliations) {
        fail('no affiliations present');
      }

      expect(within(affiliations).getByText('Department of Neuroscience, The University of Texas at Austin', { exact: false })).toBeInTheDocument();
    });

    it('returns the affiliations summary', () => {
      const affiliations = document.querySelector<HTMLOListElement>('.content-header__affiliations > ol');
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

  describe('author and affiliationn summaries', () => {
    it('returns a summary with two authors', () => {
      document.body.innerHTML = header(exampleArticleWith2AuthorsAnd2Affiliations);
      const authors = document.querySelector<HTMLOListElement>('.content-header__authors > summary');
      if (!authors) {
        fail('no authors present');
      }

      expect(within(authors).getByText('Reece Urcher 1', { exact: false })).toBeInTheDocument();
      expect(within(authors).getByText('Reece Urcher 2', { exact: false })).toBeInTheDocument();
      expect(within(authors).getAllByText('Reece Urcher', { exact: false })).toHaveLength(2);
    });

    it('returns a summary with first 2 and last authors when there are 4 authors', () => {
      document.body.innerHTML = header(exampleArticleWith4Authors3Affiliations);
      const authors = document.querySelector<HTMLOListElement>('.content-header__authors > summary');
      if (!authors) {
        fail('no authors present');
      }

      expect(within(authors).getByText('Reece Urcher 1', { exact: false })).toBeInTheDocument();
      expect(within(authors).getByText('Reece Urcher 2', { exact: false })).toBeInTheDocument();
      expect(within(authors).getByText('Reece Urcher 4', { exact: false })).toBeInTheDocument();
      expect(within(authors).getAllByText('Reece Urcher', { exact: false })).toHaveLength(3);
    });

    it('returns the affiliations summary with first 2 when there are 4 affiliations', () => {
      document.body.innerHTML = header(exampleArticleWith4Authors3Affiliations);
      const affiliations = document.querySelector<HTMLOListElement>('.content-header__affiliations > summary');
      if (!affiliations) {
        fail('no affiliations present');
      }

      expect(within(affiliations).getByText('Department of Neuroscience, The University of Texas at Austin 1', { exact: false })).toBeInTheDocument();
      expect(within(affiliations).getByText('Department of Neuroscience, The University of Texas at Austin 2', { exact: false })).toBeInTheDocument();
      expect(within(affiliations).getAllByText('Department of Neuroscience, The University of Texas at Austin', { exact: false })).toHaveLength(2);
    });
  });
});
