import {
  existsSync,
  readdirSync,
  realpathSync,
} from 'fs';
import { dirname } from 'path';
import { convertJatsToJson, PreprintXmlFile } from './conversion/encode';
import {
  ArticleRepository,
  ProcessedArticle,
  Heading,
  ArticleContent,
} from '../model/model';
import { Content, HeadingContent } from '../model/content';
import { logger } from '../utils/logger';

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
  emails?: Array<string>,
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
  identifiers?: {
    type: string,
    name: string,
    propertyID: string,
    value: string,
  }[],
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

const processXml = async (file: PreprintXmlFile): Promise<ArticleContent> => {
  // resolve path so that we can search for filenames reliable once encoda has converted the source
  const realFile = realpathSync(file);
  let json = await convertJatsToJson(realFile);
  const articleStruct = JSON.parse(json) as ArticleStruct;

  // extract DOI
  const dois = articleStruct.identifiers.filter((identifier) => identifier.name === 'doi');
  const doi = dois[0].value;

  // HACK: replace all locally referenced files with a id referencing the asset path
  const articleDir = dirname(realFile);
  logger.debug(`replacing ${articleDir} in JSON with ${doi} for client to find asset path`);
  json = json.replaceAll(articleDir, doi);

  return {
    doi,
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
    datePublished: reference?.datePublished?.value ? new Date(reference.datePublished.value) : undefined,
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
