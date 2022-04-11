import { wrapArticleInHtml } from "./article";
import { JSDOM } from 'jsdom';

const validArticleHtml = `
  <article>
    <h1 itemprop="headline" content="Article">Article</h1>
    <h2 itemscope="" itemtype="http://schema.stenci.la/Heading" id="s1">heading 1</h2>
    <h3 itemscope="" itemtype="http://schema.stenci.la/Heading" id="s1-1">subheading 1</h3>
    <h3 itemscope="" itemtype="http://schema.stenci.la/Heading" id="s1-2">subheading 2</h3>
    <h2 itemscope="" itemtype="http://schema.stenci.la/Heading" id="s2">heading 2</h2>
    <h2 itemscope="" itemtype="http://schema.stenci.la/Heading" id="s3">heading 3</h2>
  </article>  
`;

const articleHtmlNoTitle = `
  <article>
    <h2 itemscope="" itemtype="http://schema.stenci.la/Heading" id="s1">heading 1</h2>
    <h3 itemscope="" itemtype="http://schema.stenci.la/Heading" id="s1-1">subheading 1</h3>
    <h3 itemscope="" itemtype="http://schema.stenci.la/Heading" id="s1-2">subheading 2</h3>
    <h2 itemscope="" itemtype="http://schema.stenci.la/Heading" id="s2">heading 2</h2>
    <h2 itemscope="" itemtype="http://schema.stenci.la/Heading" id="s3">heading 3</h2>
  </article>
`

const articleHtmlNoHeadings = `
  <article>
    <h1 itemprop="headline" content="Article">Article</h1>
  </article>  
`;

describe('article-page', () => {
  it('wraps the article html with the themed page html', () => {
    const result = wrapArticleInHtml(validArticleHtml, '');

    expect(result.startsWith('<html lang="en">') && result.endsWith('</html>')).toBeTruthy();
  });

  it('gets the title from the html', () => {
    const wrappedArticle = wrapArticleInHtml(validArticleHtml, '');
    const container = JSDOM.fragment(wrappedArticle);

    expect(container.querySelector('title')?.textContent).toBe('Article');
  });

  it('sets the title to empty string if it is not found', () => {
    const wrappedArticle = wrapArticleInHtml(articleHtmlNoTitle, '');
    const container = JSDOM.fragment(wrappedArticle);

    expect(container.querySelector('title')?.textContent).toBe('');
  });

  it('does not include Table of Contents if no headings found', () => {
    const wrappedArticle = wrapArticleInHtml(articleHtmlNoHeadings, '');
    const container = JSDOM.fragment(wrappedArticle);

    expect(container.querySelector('.toc-container')).toBeNull();
  });

  it('generates a list of headings', () => {
    const wrappedArticle = wrapArticleInHtml(validArticleHtml, '');
    const container = JSDOM.fragment(wrappedArticle);
    const headingsNode = container.querySelectorAll('.toc-list__item > .toc-list__link');
    const headings = Array.from(headingsNode).map(element => element.textContent).filter(heading => heading !== null);

    expect(headings).toStrictEqual(expect.arrayContaining(['heading 1', 'heading 2', 'heading 3']));
  });

  it('does not add any html when there are no subheadings', () => {
    const wrappedArticle = wrapArticleInHtml(validArticleHtml, '');
    const container = JSDOM.fragment(wrappedArticle);
    const subHeadingsNode = container.querySelector('.toc-list:nth-child(2) > .toc-list__item > .toc-list__link--subheading');

    expect(subHeadingsNode).toBeNull();
  })
})
