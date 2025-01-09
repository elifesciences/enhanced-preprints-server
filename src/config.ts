export type Config = {
  port: string,
  repoConnection: string,
  repoUserName: string,
  repoPassword: string,
  elifeMetricsUrl: string | undefined,
  eppS3: S3Config,
  eppBucketName: string,
  eppBucketPrefix: string,
};
export type S3Config = {
  accessKey?: string,
  secretKey?: string,
  region: string,
  endPoint?: string,
  presignEndPoint?: string,
  webIdentityTokenFile?: string,
  awsAssumeRoleArn?: string,
};

export const config: Config = {
  port: process.env.PORT ?? '3000',
  repoConnection: process.env.REPO_CONNECTION ?? '',
  repoUserName: process.env.REPO_USERNAME ?? '',
  repoPassword: process.env.REPO_PASSWORD ?? '',
  elifeMetricsUrl: process.env.ELIFE_METRICS_URL,
  eppBucketName: process.env.BUCKET_NAME || 'epp',
  eppBucketPrefix: process.env.BUCKET_PREFIX || 'automation/',
  // s3 details
  eppS3: {
    accessKey: process.env.AWS_ACCESS_KEY_ID || undefined,
    secretKey: process.env.AWS_SECRET_ACCESS_KEY || undefined,
    region: process.env.S3_REGION || 'us-east-1',
    endPoint: process.env.S3_ENDPOINT || undefined,
    presignEndPoint: process.env.PRESIGN_S3_ENDPOINT || undefined,
    webIdentityTokenFile: process.env.AWS_WEB_IDENTITY_TOKEN_FILE || undefined,
    awsAssumeRoleArn: process.env.AWS_ROLE_ARN || undefined,
  },
};
