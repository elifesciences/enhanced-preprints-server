import { existsSync, readdirSync, readFileSync } from 'fs';
import { convertJatsToHtml, convertJatsToJson, PreprintXmlFile } from './conversion/encode';
import { ArticleStore, ProcessedArticle, ReviewingGroupStore } from '../model/model';



export const loadXmlArticlesFromDirIntoStores = (dir: string, articleStore: ArticleStore, reviewingGroupStore: ReviewingGroupStore) => {
  getReviewingGroupsFromDataDirectory(dir).forEach((reviewingGroup) => {
    reviewingGroupStore.addReviewingGroup({
      id: reviewingGroup.id,
      name: reviewingGroup.name
    });
    reviewingGroup.files.forEach(async (PreprintXmlFile) => {
      articleStore.storeArticle(await processArticle(PreprintXmlFile), reviewingGroup.id);
    });
  });

};

type ReviewingGroupData = {
  id: string,
  name: string,
  files: PreprintXmlFile[]
}
const getReviewingGroupsFromDataDirectory = (dataDir: string): ReviewingGroupData[] => {
  const reviewingGroupDirs = getDirectories(dataDir);
  const reviewGroupArticleData = reviewingGroupDirs.map((reviewingGroupDir) => {
    const info = existsSync(`${dataDir}/${reviewingGroupDir}/info.json`)
      ? JSON.parse(readFileSync(`${dataDir}/${reviewingGroupDir}/info.json`).toString()) as {id: string, name: string}
      : { id: reviewingGroupDir, name: reviewingGroupDir };

    const articles = getArticlesInReviewingGroupDir(reviewingGroupDir);

    return {
      id: info.id,
      name: info.name,
      files: articles
    };
  });
  return reviewGroupArticleData;
}

const getDirectories = (source: string) => {
  return readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

const getArticlesInReviewingGroupDir = (reviewingGroupDir: string): string[] => {
  return getDirectories(`./data/${reviewingGroupDir}`).map(articleDir => `./data/${reviewingGroupDir}/${articleDir}/${articleDir}.xml`);
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
