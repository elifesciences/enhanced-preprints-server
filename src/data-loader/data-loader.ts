import { existsSync, readdirSync, readFileSync } from 'fs';
import { convertJatsToHtml, convertJatsToJson, PreprintXmlFile } from './conversion/encode';
import { ArticleContent, ArticleRepository, ArticleStruct } from '../model/model';

const getDirectories = (source: string) => readdirSync(source, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

const processArticle = async (file: PreprintXmlFile): Promise<ArticleContent> => {
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

export const loadXmlArticlesFromDirIntoStores = async (dataDir: string, articleRepository: ArticleRepository) => {
  const xmlFiles = getDirectories(dataDir).map((articleId) => `${dataDir}/${articleId}/${articleId}.xml`).filter((xmlFilePath) => existsSync(xmlFilePath));

  for (const xmlFile of xmlFiles) {
    const articleContent = await processArticle(xmlFile);
    try {
      await articleRepository.getArticle(articleContent.doi);
    } catch (error) {
      await articleRepository.storeArticle(articleContent);
    }
  }
};
