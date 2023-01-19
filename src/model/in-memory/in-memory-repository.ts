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
}

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
    return Array.from(this.store.values()).map((article) => ({
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
    const allVersions = Array.from(this.versionedStore.values()).filter((article) => article.id === identifier || article.msid === identifier).sort(comparePreprintPostedDates);

    if (allVersions.length === 0) {
      throw Error('Cannot find a matching article Version');
    }

    const askedForVersion = allVersions.filter((version) => version.id === identifier);
    if (askedForVersion.length === 1) {
      return {
        current: askedForVersion[0],
        versions: allVersions,
      };
    }
    return {
      current: allVersions.slice(-1)[0],
      versions: allVersions,
    };
  }
}

export const createInMemoryArticleRepository = async (): Promise<ArticleRepository> => new InMemoryArticleRepository(new Map<string, ProcessedArticle>(), new Map<string, VersionedArticle>());
