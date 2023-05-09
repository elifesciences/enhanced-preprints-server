import {
  ArticleRepository,
  ProcessedArticle,
  ArticleSummary,
  EnhancedArticle,
  EnhancedArticleWithVersions,
  ArticleHash,
} from '../model';

const comparePreprintPostedDates = (a: EnhancedArticle, b: EnhancedArticle): number => {
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

  versionedStore: Map<string, EnhancedArticle>;

  constructor(store: Map<string, ProcessedArticle>, versionedStore: Map<string, EnhancedArticle>) {
    this.store = store;
    this.versionedStore = versionedStore;
  }

  async storeArticle(article: ProcessedArticle, id: string): Promise<boolean> {
    this.store.set(id, article);

    return true;
  }

  async getArticle(id: string): Promise<ProcessedArticle> {
    const article = this.store.get(id);
    if (article === undefined) {
      throw new Error(`Article with ID "${id}" was not found`);
    }

    return article;
  }

  async getArticleSummaries(): Promise<ArticleSummary[]> {
    return Array.from(this.store.entries())
      .map(([id, article]) => ({
        id,
        doi: article.doi,
        title: article.title,
        date: article.date,
      }));
  }

  async getArticleHashes(): Promise<ArticleHash[]> {
    return Array.from(this.store.entries())
      .map(([id, article]) => ({
        id,
        hash: article.hash,
      }));
  }

  async storeEnhancedArticle(article: EnhancedArticle): Promise<boolean> {
    if (this.versionedStore.has(article.id)) {
      return false;
    }

    this.versionedStore.set(article.id, article);

    return true;
  }

  async getArticleVersion(identifier: string): Promise<EnhancedArticleWithVersions> {
    const version = this.versionedStore.get(identifier);

    if (version) {
      const allVersions = Array.from(this.versionedStore.values())
        .filter((article) => article.msid === version.msid)
        .reduce((record: Record<string, EnhancedArticle>, otherVersion) => {
          const toReturn = record;
          toReturn[otherVersion.id] = otherVersion;
          return toReturn;
        }, {});

      return {
        article: version,
        versions: allVersions,
      };
    }

    const versions = Array.from(this.versionedStore.values())
      .filter((article) => article.msid === identifier)
      .sort(comparePreprintPostedDates)
      .reverse();
    if (!versions.length) throw Error(`Unable to locate versions with id/msid ${identifier}`);
    return {
      article: versions[0],
      versions: versions.reduce((record: Record<string, EnhancedArticle>, otherVersion) => {
        const toReturn = record;
        toReturn[otherVersion.id] = otherVersion;
        return toReturn;
      }, {}),
    };
  }
}

export const createInMemoryArticleRepository = async (): Promise<ArticleRepository> => new InMemoryArticleRepository(new Map<string, ProcessedArticle>(), new Map<string, EnhancedArticle>());
