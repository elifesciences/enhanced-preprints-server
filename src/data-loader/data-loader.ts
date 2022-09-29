import {
  existsSync,
  readdirSync,
  realpathSync,
} from 'fs';
import { JSDOM } from 'jsdom';
import { dirname } from 'path';
import { convertJatsToHtml, convertJatsToJson, PreprintXmlFile } from './conversion/encode';
import {
  ArticleRepository,
  ProcessedArticle,
  Heading,
  ArticleContent,
} from '../model/model';
import { Content, HeadingContent } from '../model/content';
import { logger } from '../utils/logger';
import { config } from '../config';

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
  affiliations?: Array<Organisation>,
  familyNames: Array<string>,
  givenNames: Array<string>,
};
type License = {
  type: 'CreativeWork',
  url: string,
};
type PublicationType = 'PublicationVolume' | 'Periodical';
type Publication = {
  type: PublicationType,
  name: string,
  volumeNumber?: number,
  isPartOf?: Publication,
};
type Reference = {
  type: 'Article',
  id: string,
  title: string,
  url: string,
  pageEnd: number,
  pageStart: number,
  authors: Array<Person>,
  datePublished: {
    type: string,
    value: string
  },
  isPartOf?: Publication,
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
  references: Reference[],
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
  const abstractHeading = articleDom.querySelector('article > [data-itemprop="description"] > h2[data-itemtype="https://schema.stenci.la/Heading"]');
  abstractHeading?.setAttribute('id', 'abstract');

  // extract all HTML elements after [data-itemprop="identifiers"] (the last of the "header" elements)
  const articleHtml = Array.from(articleElement.querySelectorAll('[data-prop="identifiers"] ~ *'))
    .reduce((prev, current) => prev.concat(current.outerHTML), '');

  return `<article itemtype="https://schema.org/Article">${articleHtml}</article>`;
};

const processXml = async (file: PreprintXmlFile): Promise<ArticleContent> => {
  // resolve path so that we can search for filenames reliable once encoda has converted the source
  const realFile = realpathSync(file);
  let html = await convertJatsToHtml(realFile, !config.iiifServer);
  let json = await convertJatsToJson(realFile);
  const articleStruct = JSON.parse(json) as ArticleStruct;

  // extract DOI
  const dois = articleStruct.identifiers.filter((identifier) => identifier.name === 'doi');
  const doi = dois[0].value;

  // HACK: if we have a configured IIIF server, replace all locally referenced files with a relative URL path to the
  // IIIF-redirect endpoint
  if (config.iiifServer) {
    const articleDir = dirname(realFile);
    logger.debug(`replacing ${articleDir} in JSON and HTML with /article/${doi}/attachment for IIIF server`);
    json = json.replaceAll(articleDir, `/article/${doi}/attachment`);
    html = html.replaceAll(articleDir, `/article/${doi}/attachment`);
  }

  // extract HTML content without header
  const content = extractArticleHtmlWithoutHeader(JSDOM.fragment(html));

  return {
    doi,
    html: content,
    document: json,
  };
};

const extractHeadings = (content: Content): Heading[] => {
  if (typeof content === 'string') {
    return [];
  }

  if (!Array.isArray(content)) {
    return extractHeadings([content]);
  }

  const headingContentParts = content.filter((contentPart) => {
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
      text: heading.content,
    };
  });

  return headings;
};

const processArticle = (article: ArticleContent): ProcessedArticle => {
  const articleStruct = JSON.parse(article.document) as ArticleStruct;

  // extract title
  const {
    title, authors, description: abstract, licenses,
  } = articleStruct;

  // extract publish date
  const date = new Date(articleStruct.datePublished.value);

  // map datePublished in references to a date
  const references = articleStruct.references.map((reference) => ({
    ...reference,
    datePublished: new Date(reference.datePublished.value),
  }));

  return {
    ...article,
    title,
    date,
    authors,
    abstract,
    licenses,
    content: articleStruct.content,
    headings: extractHeadings(articleStruct.content),
    references,
  };
};

export const loadXmlArticlesFromDirIntoStores = async (dataDir: string, articleRepository: ArticleRepository): Promise<boolean[]> => {
  const existingDocuments = (await articleRepository.getArticleSummaries()).map(({ doi }) => doi);
  const xmlFiles = getDirectories(dataDir)
    .map((articleId) => `${dataDir}/${articleId}/${articleId}.xml`)
    .filter((xmlFilePath) => existsSync(xmlFilePath));

  const articlesToLoad = (await Promise.all(xmlFiles.map((xmlFile) => processXml(xmlFile))))
    .filter((article) => !existingDocuments.includes(article.doi))
    .map(processArticle);

  return Promise.all(articlesToLoad.map((article) => articleRepository.storeArticle(article)));
};
