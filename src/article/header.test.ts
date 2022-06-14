import { JSDOM } from 'jsdom';
import { header } from './header';

const validArticleFragment = JSDOM.fragment(`
  <article>
    <h1 itemprop="headline" content="Article">Article</h1>
    <ol data-itemprop="authors">
      <li itemtype="http://schema.org/Person" itemprop="author">
        <meta itemprop="name" content="Dr Reece Urcher">
        <span data-itemprop="givenNames">
          <span itemprop="givenName">Reece</span>
        </span>
        <span data-itemprop="familyNames">
          <span itemprop="familyName">Urcher</span>
        </span>
        <span data-itemprop="affiliations">
          <a itemprop="affiliation" href="#author-organization-1">1</a>
        </span>
      </li>
    </ol>
    <ol data-itemprop="affiliations">
      <li itemtype="http://schema.org/Organization" itemid="#author-organization-1" id="author-organization-1">
        <span itemprop="name">Department of Neuroscience, The University of Texas at Austin</span>
      </li>
    </ol>
    <span itemtype="http://schema.org/Organization" itemprop="publisher">
      <meta itemprop="name" content="Unknown">
      <span itemtype="http://schema.org/ImageObject" itemprop="logo">
        <meta itemprop="url" content="https://via.placeholder.com/600x60/dbdbdb/4a4a4a.png?text=Unknown">
      </span>
    </span>
    <time itemprop="datePublished" datetime="2021-07-06">2021-07-06</time>
    <ul data-itemprop="about">
      <li itemtype="http://schema.org/DefinedTerm" itemprop="about">
        <span itemprop="name">New Results</span>
      </li>
    </ul>
    <ul data-itemprop="identifiers">
      <li itemtype="http://schema.org/PropertyValue" itemprop="identifier">
        <meta itemprop="propertyID" content="https://registry.identifiers.org/registry/doi">
        <span itemprop="name">doi</span><span itemprop="value">12.345/67890213445</span>
      </li>
    </ul>
    <h2 itemtype="http://schema.stenci.la/Heading" id="s1">heading 1</h2>
    <h3 itemtype="http://schema.stenci.la/Heading" id="s1-1">subheading 1</h3>
    <h3 itemtype="http://schema.stenci.la/Heading" id="s1-2">subheading 2</h3>
    <h2 itemtype="http://schema.stenci.la/Heading" id="s2">heading 2</h2>
    <h2 itemtype="http://schema.stenci.la/Heading" id="s3">heading 3</h2>
  </article>
`);

describe('header', () => {
  it('removes unwanted itemprop and data-itemprop attributes', () => {
    const result = JSDOM.fragment(header(validArticleFragment));

    expect(result.querySelector('article > h1')).toBeNull();
    expect(result.querySelector('article > [data-itemprop="authors"]')).toBeNull();
    expect(result.querySelector('article > [data-itemprop="affiliations"]')).toBeNull();
    expect(result.querySelector('article > [itemprop="publisher"]')).toBeNull();
    expect(result.querySelector('article > [itemprop="datePublished"]')).toBeNull();
    expect(result.querySelector('article > [data-itemprop="identifiers"]')).toBeNull();
  });

  describe('text extraction', () => {
    const result = JSDOM.fragment(header(validArticleFragment));

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
