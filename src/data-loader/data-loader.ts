import { existsSync, readdirSync, readFileSync } from 'fs';
import { convertJatsToHtml, convertJatsToJson, PreprintXmlFile } from './conversion/encode';
import { ArticleRepository, ProcessedArticle } from '../model/model';



export const loadXmlArticlesFromDirIntoStores = (dataDir: string, articleRepository: ArticleRepository) => {
  const xmlFiles = getDirectories(dataDir).map(articleId => `${dataDir}/${articleId}/${articleId}.xml`).filter((xmlFilePath) => existsSync(xmlFilePath));
  xmlFiles.forEach(async (xmlFile) => {
    articleRepository.storeArticle(await processArticle(xmlFile));
  });
}

const getDirectories = (source: string) => {
  return readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

const processArticle = async (file: PreprintXmlFile): Promise<ProcessedArticle> => {
  const xml = readFileSync(file).toString();
  const html = await convertJatsToHtml(file);
  const json = await convertJatsToJson(file);
  const articleStruct = JSON.parse(json) as ArticleJsonObject;

  // extract DOI
  const dois = articleStruct.identifiers.filter((identifier) => {
    if (identifier.name == "doi") {
      return true;
    }
    return false;
  });
  const doi = dois[0].value;

  // extract title
  const title = articleStruct.title;

  //extract publish date
  const date = articleStruct.datePublished.value;
  return {
    doi: doi,
    title: title,
    date: new Date(date),
    xml: xml,
    html: html,
    json: json,
  }
};


type ArticleIdentifier = {
  name: string,
  value: string
}
type ArticleJsonObject = {
  id: string,
  journal: string,
  title: string,
  datePublished: DateType
  dateAccepted: DateType
  dateReceived: DateType
  identifiers: Array<ArticleIdentifier>
}

type DateType = {
  type: string,
  value: string
}
