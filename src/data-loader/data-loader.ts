import { existsSync, readdirSync, readFileSync } from 'fs';
import { convertJatsToHtml, convertJatsToJson, PreprintXmlFile } from './conversion/encode';
import { ArticleContent, ArticleRepository, ArticleStruct } from '../model/model';



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

const processArticle = async (file: PreprintXmlFile): Promise<ArticleContent> => {
  const xml = readFileSync(file).toString();
  const html = await convertJatsToHtml(file);
  const json = await convertJatsToJson(file);
  const articleStruct = JSON.parse(json) as ArticleStruct;

  // extract DOI
  const dois = articleStruct.identifiers.filter((identifier) => {
    if (identifier.name == "doi") {
      return true;
    }
    return false;
  });
  const doi = dois[0].value;

  return {
    doi: doi,
    xml: xml,
    html: html,
    json: json,
  }
};
