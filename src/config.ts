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
    endPoint: process.env.S3_ENDPOINT ?? 'https://s3.amazonaws.com',
    accessKey: process.env.S3_ACCESS_KEY ?? '',
    secretKey: process.env.S3_SECRET_KEY ?? '',
  },
  awsAssumeRole: {
    webIdentityTokenFile: process.env.AWS_WEB_IDENTITY_TOKEN_FILE ?? undefined,
    roleArn: process.env.AWS_ROLE_ARN ?? undefined,
    clientConfig: {
      region: process.env.S3_REGION ?? 'us-east-1',
    },
  },
  s3Bucket: process.env.S3_BUCKET ?? '',
  s3Region: process.env.S3_REGION ?? 'us-east-1',
};
