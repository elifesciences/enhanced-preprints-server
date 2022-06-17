import { createInMemoryArticleRepository } from './in-memory/in-memory-repository';
import { ArticleRepository } from './model';
import { createSqliteArticleRepository } from './sqlite/sqlite-repository';
import { createCouchDBArticleRepository } from './couchdb/couchdb-repository';

export enum StoreType {
  InMemory = 'InMemory',
  Sqlite = 'Sqlite',
  CouchDB = 'CouchDB',
}

export const createArticleRepository = async (kind: StoreType, connectionString = ''): Promise<ArticleRepository> => {
  switch (kind) {
    case StoreType.Sqlite:
      return createSqliteArticleRepository(connectionString);
    case StoreType.CouchDB:
      return createCouchDBArticleRepository(connectionString);
    case StoreType.InMemory:
    default:
      return createInMemoryArticleRepository();
  }
};
