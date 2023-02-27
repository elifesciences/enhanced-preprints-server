import { StoreType } from './model/create-article-repository';
import { logger } from './utils/logger';

const getStoreTypeFromString = (repoType: string): StoreType => {
  if (repoType === 'MongoDB') {
    return StoreType.MongoDB;
  }
  if (repoType === 'InMemory') {
    return StoreType.InMemory;
  }

  logger.error(`Cannot find article repository type of ${repoType}, defaulting to InMemory`);
  return StoreType.InMemory;
};

export const config = {
  id: process.env.REVIEWGROUP_ID ?? 'https://elifesciences.org',
  name: process.env.REVIEWGROUP_NAME ?? 'eLife',
  dataDir: process.env.IMPORT_DIR_PATH ?? './data/10.1101',
  repoType: process.env.REPO_TYPE ? getStoreTypeFromString(process.env.REPO_TYPE) : StoreType.InMemory,
  repoConnection: process.env.REPO_CONNECTION ?? './data.db',
  repoUserName: process.env.REPO_USERNAME ?? '',
  repoPassword: process.env.REPO_PASSWORD ?? '',
  s3: {
    endPoint: process.env.S3_ENDPOINT ?? 's3.amazonaws.com',
    port: process.env.S3_PORT ? Number(process.env.S3_PORT) : undefined,
    useSSL: process.env.S3_SSL === 'false' ? false : undefined,
    accessKey: process.env.S3_ACCESS_KEY ?? '',
    secretKey: process.env.S3_SECRET_KEY ?? '',
    sessionToken: process.env.S3_SESSION_TOKEN ?? undefined,
  },
  s3Bucket: process.env.S3_BUCKET ?? '',
};
