import { existsSync, readdirSync, readFileSync } from 'fs';
import { convertJatsToHtml, convertJatsToJson, PreprintXmlFile } from './conversion/encode';
import { ArticleHTML, ArticleRepository, Doi, ProcessedArticle, Heading } from '../model/model';
import { Content, HeadingContent, normaliseContentToMarkdown } from '../model/utils';
import { JSDOM } from 'jsdom';

export type ArticleXML = string;
export type ArticleJSON = string;
export type ArticleContent = {
  doi: Doi
  xml: ArticleXML,
  html: ArticleHTML,
  json: ArticleJSON,
};

// type related to the JSON output of encoda
type Address = {
  type: 'PostalAddress',
  addressCountry: string,
};
type Organisation = {
  type: 'Organization',
  name: string,
  address: Address,
};
type Person = {
  type: 'Person',
  affiliations: Array<Organisation>,
  familyNames: Array<string>,
  givenNames: Array<string>,
};
type License = {
  type: 'CreativeWork',
  url: string,
};

export type ArticleStruct = {
  id: string,
  journal: string,
  title: Content,
  datePublished: DateType
  dateAccepted: DateType
  dateReceived: DateType
  identifiers: Array<ArticleIdentifier>
  authors: Array<Person>,
  description: Content,
  licenses: Array<License>,
  content: Content,
};
type ArticleIdentifier = {
  name: string,
  value: string
};

type DateType = {
  type: string,
  value: string
};

const getDirectories = (source: string) => readdirSync(source, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

const processXml = async (file: PreprintXmlFile): Promise<ArticleContent> => {
  const xml = readFileSync(file).toString();
  const html = await convertJatsToHtml(file);
  const json = await convertJatsToJson(file);
  const articleStruct = JSON.parse(json) as ArticleStruct;

  // extract DOI
  const dois = articleStruct.identifiers.filter((identifier) => identifier.name === 'doi');
  const doi = dois[0].value;

  return {
    doi,
    xml,
    html,
    json,
  };
};

const extractHeadings = (articleStruct: ArticleStruct): Heading[] => {
  if (typeof articleStruct.content === 'string') {
    return [];
  }

  const headingContentParts = articleStruct.content.filter((contentPart) => {
    if (typeof contentPart === 'string') {
      return false;
    }

    if (contentPart.type !== 'Heading') {
      return false;
    }

    const heading = contentPart as HeadingContent;

    if (heading.depth > 1) {
      return false;
    }

    return true;
  });

  const headings = headingContentParts.map((contentPart) => {
    const heading = contentPart as HeadingContent;
    return {
      id: heading.id,
      text: normaliseContentToMarkdown(heading.content),
    };
  });

  return headings;
};

const extractArticleHtmlWithoutHeader = (articleDom: DocumentFragment): string => {
  const articleElement = articleDom.children[0];
  const articleHtml = Array.from(articleElement.querySelectorAll('[data-itemprop="identifiers"] ~ *'))
    .reduce((prev, current) => prev.concat(current.outerHTML), '');

  return `<article itemtype="http://schema.org/Article">${articleHtml}</article>`;
};

const processArticle = (article: ArticleContent): ProcessedArticle => {
  const articleStruct = JSON.parse(article.json) as ArticleStruct;

  // extract title
  const { title } = articleStruct;

  // extract publish date
  const date = new Date(articleStruct.datePublished.value);

  return {
    doi: article.doi,
    title: normaliseContentToMarkdown(title),
    date,
    authors: articleStruct.authors,
    abstract: normaliseContentToMarkdown(articleStruct.description),
    licenses: articleStruct.licenses,
    content: extractArticleHtmlWithoutHeader(JSDOM.fragment(article.html)),
    headings: extractHeadings(articleStruct),
  };
};

export const loadXmlArticlesFromDirIntoStores = (dataDir: string, articleRepository: ArticleRepository): Promise<boolean[]> => {
  const xmlFiles = getDirectories(dataDir).map((articleId) => `${dataDir}/${articleId}/${articleId}.xml`).filter((xmlFilePath) => existsSync(xmlFilePath));

  return Promise.all(xmlFiles.map((xmlFile) => processXml(xmlFile).then((articleContent) => articleRepository.storeArticle(processArticle(articleContent)))));
};
