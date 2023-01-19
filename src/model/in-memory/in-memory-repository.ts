import {
  Doi,
  ArticleRepository,
  ProcessedArticle,
  ArticleSummary,
  VersionedArticle,
  VersionedArticlesWithVersions,
} from '../model';

const comparePreprintPostedDates = (a: VersionedArticle, b: VersionedArticle): number => {
  if (a.preprintPosted < b.preprintPosted) {
    return -1;
  }
  if (a.preprintPosted > b.preprintPosted) {
    return 1;
  }
  return 0;
};

class InMemoryArticleRepository implements ArticleRepository {
  store: Map<string, ProcessedArticle>;

  versionedStore: Map<string, VersionedArticle>;

  constructor(store: Map<string, ProcessedArticle>, versionedStore: Map<string, VersionedArticle>) {
    this.store = store;
    this.versionedStore = versionedStore;
  }

  async storeArticle(article: ProcessedArticle): Promise<boolean> {
    if (this.store.has(article.doi)) {
      return false;
    }

    this.store.set(article.doi, article);

    return true;
  }

  async getArticle(doi: Doi): Promise<ProcessedArticle> {
    const article = this.store.get(doi);
    if (article === undefined) {
      throw new Error(`Article with DOI "${doi}" was not found`);
    }

    return article;
  }

  async getArticleSummaries(): Promise<ArticleSummary[]> {
    return Array.from(this.store.values())
      .map((article) => ({
        doi: article.doi,
        title: article.title,
        date: article.date,
      }));
  }

  async storeVersionedArticle(article: VersionedArticle): Promise<boolean> {
    if (this.versionedStore.has(article.id)) {
      return false;
    }

    this.versionedStore.set(article.id, article);

    return true;
  }

  async getArticleVersion(identifier: string): Promise<VersionedArticlesWithVersions> {
    const version = this.versionedStore.get(identifier);

    if (version) {
      const allVersions = Array.from(this.versionedStore.values())
        .filter((article) => article.msid === version.msid)
        .reduce((record: Record<string, VersionedArticle>, otherVersion) => {
          const toReturn = record;
          toReturn[otherVersion.id] = otherVersion;
          return toReturn;
        }, {});

      return {
        current: version,
        versions: allVersions,
      };
    }

    const versions = Array.from(this.versionedStore.values())
      .filter((article) => article.msid === identifier)
      .sort(comparePreprintPostedDates)
      .reverse();
    if (!versions.length) throw Error(`Unable to locate versions with id/msid ${identifier}`);
    return {
      current: versions[0],
      versions: versions.reduce((record: Record<string, VersionedArticle>, otherVersion) => {
        const toReturn = record;
        toReturn[otherVersion.id] = otherVersion;
        return toReturn;
      }, {}),
    };
  }
}

export const createInMemoryArticleRepository = async (): Promise<ArticleRepository> => new InMemoryArticleRepository(new Map<string, ProcessedArticle>(), new Map<string, VersionedArticle>());
