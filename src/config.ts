export const config = {
  port: process.env.PORT ?? 3000,
  repoConnection: process.env.REPO_CONNECTION ?? '',
  repoUserName: process.env.REPO_USERNAME ?? '',
  repoPassword: process.env.REPO_PASSWORD ?? '',
  docmapsApi: process.env.DOCMAPS_API ?? 'https://data-hub-api.elifesciences.org/enhanced-preprints/docmaps/v2/by-publisher/elife/get-by-manuscript-id?manuscript_id=',
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
