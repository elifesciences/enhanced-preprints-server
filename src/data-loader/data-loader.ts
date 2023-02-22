import { existsSync, readdirSync, realpathSync } from 'fs';
import { dirname } from 'path';
import { Client as MinioClient } from 'minio';
import { convertJatsToJson, PreprintXmlFile } from './conversion/encode';
import {
  ArticleContent, ArticleRepository, Heading, OrcidIdentifier as OrcidModel, ProcessedArticle,
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
type Identifier = {
  type?: string,
  propertyID?: string,
  name?: string
  value: string
};
type OrcidIdentifier = {
  type: 'PropertyValue',
  propertyID: 'https://registry.identifiers.org/registry/orcid',
  value: string
};
type Person = {
  type: 'Person',
  affiliations?: Array<Organisation>,
  familyNames: Array<string>,
  givenNames: Array<string>,
  emails?: Array<string>,
  identifiers?: Array<Identifier>,
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

const getS3Connection = () => new MinioClient(config.s3);

const getDirectories = (source: string) => readdirSync(source, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

const getAvailableManuscriptPaths = async (client: MinioClient): Promise<string[]> => new Promise((resolve, reject) => {
  const filesStream = client.listObjects(config.s3Bucket, 'data/', true);
  const manuscriptPaths: string[] = [];

  filesStream.on('data', (obj) => {
    if (obj.name.endsWith('.xml')) {
      manuscriptPaths.push(obj.name);
    }
  });
  filesStream.on('end', () => {
    resolve(manuscriptPaths);
  });
  filesStream.on('error', (e) => {
    reject(e);
  });
});

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

const fetchXmlS3 = async (client: MinioClient, xmlPath: string): Promise<string> => new Promise((resolve, reject) => {
  let xml = '';
  client.getObject(config.s3Bucket, xmlPath, (err: unknown, fileStream: any) => {
    if (err) {
      reject(err);
    }

    fileStream.on('data', (data: any) => {
      xml += data;
    });
    fileStream.on('end', () => {
      resolve(xml);
    });
    fileStream.on('error', (e: any) => {
      reject(e);
    });
  });
});

const processXmlString = async (xml: string): Promise<ArticleContent> => {
  // resolve path so that we can search for filenames reliable once encoda has converted the source
  const json = await convertJatsToJson(xml);
  const articleStruct = JSON.parse(json);

  // console.log('Article: >> ', articleStruct);

  // extract DOI
  const dois = articleStruct.identifiers.filter((identifier: any) => identifier.name === 'doi');
  const doi = dois[0].value;

  // figure out in the json that comes back from encoda what external assets there are (i.e images)

  const figures = articleStruct.content.length !== undefined ? articleStruct.content.filter((content: any) => !!content.type && content.type === 'Figure') : undefined;
  console.log('Figures: >> ', figures);

  // HACK: replace all locally referenced files with a id referencing the asset path
  // const articleDir = dirname(realFile);
  // logger.debug(`replacing ${articleDir} in JSON with ${doi} for client to find asset path`);
  // json = json.replaceAll(articleDir, doi);

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

    if (Array.isArray(contentPart)) {
      return extractHeadings(content);
    }

    if (contentPart.type !== 'Heading') {
      return false;
    }

    return contentPart.depth <= 1;
  });

  return headingContentParts.map((contentPart) => {
    const heading = contentPart as HeadingContent;
    return {
      id: heading.id,
      text: heading.content,
    };
  });
};

const processArticle = (article: ArticleContent): ProcessedArticle => {
  const articleStruct = JSON.parse(article.document) as ArticleStruct;

  // extract title
  const {
    title, description: abstract, licenses,
  } = articleStruct;

  // extract publish date
  const date = new Date(articleStruct.datePublished.value);

  // map datePublished in references to a date, and author references to orcids
  const references = articleStruct.references.map((reference) => ({
    ...reference,
    datePublished: reference.datePublished?.value ? new Date(reference.datePublished.value) : undefined,
    authors: reference.authors.map((author) => ({
      ...author,
      identifiers: author.identifiers
        ?.filter<OrcidIdentifier>((identifier): identifier is OrcidIdentifier => identifier.propertyID === 'https://registry.identifiers.org/registry/orcid')
        .map<OrcidModel>((identifier) => ({ type: 'orcid', value: identifier.value })),
    })),
  }));

  // map author OrcIds
  const authors = articleStruct.authors.map((author) => {
    // map identifiers
    const identifiers = author.identifiers
      ?.filter<OrcidIdentifier>((identifier): identifier is OrcidIdentifier => identifier.propertyID === 'https://registry.identifiers.org/registry/orcid')
      .map<OrcidModel>((identifier) => ({
      type: 'orcid',
      value: identifier.value.trim(),
    })) ?? undefined;

    return {
      ...author,
      identifiers,
    };
  });

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
  // ['10.1101/2021.11.17.469032']
  const existingDocuments = (await articleRepository.getArticleSummaries()).map(({ doi }) => doi);

  const s3 = getS3Connection();
  // ['data/10.1101/2021.11.17.469032/2021.11.17.469032.xml']
  const xmlFiles = await getAvailableManuscriptPaths(s3);
  console.log('Files: >> ', xmlFiles);
  // Filter DOIs here!!
  const filteredXmlFiles = xmlFiles.filter((file) => !existingDocuments.some((doc) => file.includes(doc)));

  const articlesToLoad = await Promise.all(
    filteredXmlFiles.map(async (xmlFile) => fetchXmlS3(s3, xmlFile)
      .then((xml) => processXmlString(xml)))
      .map(async (articleContent) => processArticle(await articleContent)),
  );

  return Promise.all(articlesToLoad.map((article) => articleRepository.storeArticle(article)));
};
