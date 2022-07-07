import { existsSync, readdirSync, readFileSync } from 'fs';
import { convertJatsToHtml, convertJatsToJson, PreprintXmlFile } from './conversion/encode';
import { ArticleContent, ArticleRepository, Doi } from '../model/model';
import { Content } from '../model/utils';
import { JSDOM } from 'jsdom';

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

const extractArticleHtmlWithoutHeader = (articleDom: DocumentFragment): string => {
  const articleElement = articleDom.children[0];

  // label the abstract with an id
  const abstractHeading = articleDom.querySelector('article > [data-itemprop="description"] > h2[data-itemtype="http://schema.stenci.la/Heading"]');
  abstractHeading?.setAttribute('id', 'abstract');

  // extract all HTML elements after [data-itemprop="identifiers"] (the last of the "header" elements)
  const articleHtml = Array.from(articleElement.querySelectorAll('[data-itemprop="identifiers"] ~ *'))
    .reduce((prev, current) => prev.concat(current.outerHTML), '');

  return `<article itemtype="http://schema.org/Article">${articleHtml}</article>`;
};

const processArticle = async (file: PreprintXmlFile): Promise<ArticleContent> => {
  const xml = readFileSync(file).toString();
  const html = await convertJatsToHtml(file);
  const json = await convertJatsToJson(file);
  const articleStruct = JSON.parse(json) as ArticleStruct;

  // extract DOI
  const dois = articleStruct.identifiers.filter((identifier) => identifier.name === 'doi');
  const doi = dois[0].value;

  // extract HTML content without header
  const content = extractArticleHtmlWithoutHeader(JSDOM.fragment(html));

  return {
    doi,
    xml,
    html: content,
    json,
  };
};

export const loadXmlArticlesFromDirIntoStores = (dataDir: string, articleRepository: ArticleRepository): Promise<boolean[]> => {
  const xmlFiles = getDirectories(dataDir).map((articleId) => `${dataDir}/${articleId}/${articleId}.xml`).filter((xmlFilePath) => existsSync(xmlFilePath));

  return Promise.all(xmlFiles.map((xmlFile) => processArticle(xmlFile).then((articleContent) => articleRepository.storeArticle(articleContent))));
};
