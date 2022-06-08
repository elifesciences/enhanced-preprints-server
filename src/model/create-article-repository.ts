import { createInMemoryArticleRepository } from './in-memory/in-memory-repository';
import { ArticleRepository } from './model';
import { createSqliteArticleRepository } from './sqlite/sqlite-repository';

export enum StoreType {
  InMemory = 'InMemory',
  Sqlite = 'Sqlite',
}

export const createArticleRepository = async (kind: StoreType, connectionString = ''): Promise<ArticleRepository> => {
  if (kind === StoreType.Sqlite) {
    return createSqliteArticleRepository(connectionString);
  }

  // default to InMemory
  return createInMemoryArticleRepository();
};
