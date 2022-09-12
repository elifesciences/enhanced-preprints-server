import { createInMemoryArticleRepository } from './in-memory/in-memory-repository';
import { ArticleRepository } from './model';
import { createMongoDBArticleRepository } from './mongodb/mongodb-repository';

export enum StoreType {
  InMemory = 'InMemory',
  MongoDB = 'MongoDB',
}

export const createArticleRepository = async (kind: StoreType, connectionString = '', username = '', password = ''): Promise<ArticleRepository> => {
  switch (kind) {
    case StoreType.MongoDB:
      return createMongoDBArticleRepository(connectionString, username, password);
    case StoreType.InMemory:
    default:
      return createInMemoryArticleRepository();
  }
};
