import {
  realpathSync, rmSync, createWriteStream, readFileSync,
} from 'fs';
import { mkdtemp } from 'fs/promises';
import { pipeline } from 'node:stream/promises';
import { basename, dirname, join } from 'path';
import { tmpdir } from 'os';
import { S3Client, GetObjectCommand, paginateListObjectsV2 } from '@aws-sdk/client-s3';
import { fromWebToken } from '@aws-sdk/credential-providers';
import { Readable } from 'stream';
import { convertJatsToJson, PreprintXmlFile } from './conversion/encode';
import {
  ArticleContent, ArticleRepository, Heading, OrcidIdentifier as OrcidModel, ProcessedArticle,
} from '../../model/model';
import { Content, HeadingContent } from '../../model/content';
import { logger } from '../../utils/logger';
import { config } from '../../config';

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

const getS3Connection = () => {
  if (config.awsAssumeRole.webIdentityTokenFile !== undefined && config.awsAssumeRole.roleArn !== undefined) {
    const webIdentityToken = readFileSync(config.awsAssumeRole.webIdentityTokenFile, 'utf-8');
    const { roleArn, clientConfig } = config.awsAssumeRole;
    return new S3Client({
      credentials: fromWebToken({
        roleArn,
        clientConfig,
        webIdentityToken,
      }),
      endpoint: config.s3.endPoint,
      forcePathStyle: true,
      region: config.s3Region,
    });
  }

  return new S3Client({
    credentials: {
      accessKeyId: config.s3.accessKey,
      secretAccessKey: config.s3.secretKey,
    },
    endpoint: config.s3.endPoint,
    forcePathStyle: true,
    region: config.s3Region,
  });
};

const getAvailableManuscriptPaths = async (client: S3Client): Promise<string[]> => {
  const manuscriptPaths: string[] = [];

  /* eslint-disable-next-line no-restricted-syntax */
  for await (const data of paginateListObjectsV2({ client }, { Bucket: config.s3Bucket, Prefix: 'data/' })) {
    data.Contents?.map(({ Key }) => !!Key && Key.endsWith('.xml') && manuscriptPaths.push(Key));
  }

  return manuscriptPaths;
};

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

const fetchXml = async (client: S3Client, xmlPath: string): Promise<string> => {
  const xmlFileName = basename(xmlPath);
  const downloadDir = await mkdtemp(join(tmpdir(), xmlFileName));
  const articlePath = `${downloadDir}/article.xml`;

  const objectRequest = await client.send(new GetObjectCommand({
    Bucket: config.s3Bucket,
    Key: xmlPath,
  }));

  if (objectRequest.Body === undefined) {
    throw Error('file is empty');
  }

  const writeStream = createWriteStream(articlePath);
  await pipeline((objectRequest.Body as Readable), writeStream);

  return articlePath;
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

export const loadXmlArticlesFromS3IntoStores = async (articleRepository: ArticleRepository): Promise<boolean[]> => {
  const s3 = getS3Connection();
  const xmlFiles = await getAvailableManuscriptPaths(s3);

  // fetch XML to FS, convert to JSON, map to Article data structure
  return Promise.all(
    xmlFiles.map(async (xmlS3FilePath) => fetchXml(s3, xmlS3FilePath)
      .then(async (xmlFilePath) => {
        const articleContent = await processXml(xmlFilePath);
        rmSync(dirname(xmlFilePath), { recursive: true, force: true });
        return articleContent;
      })
      .then((articleContent) => processArticle(articleContent))
      .then((article) => articleRepository.storeArticle(article, dirname(xmlS3FilePath).replace('data/', '')))),
  );
};
