import { readFileSync } from 'fs';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { fromWebToken, fromTemporaryCredentials } from '@aws-sdk/credential-providers';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { type S3Config, config } from '../config';

const getAWSCredentials = (s3config: S3Config) => {
  if (s3config.webIdentityTokenFile !== undefined && s3config.awsAssumeRoleArn !== undefined) {
    const webIdentityToken = readFileSync(s3config.webIdentityTokenFile, 'utf-8');
    return fromWebToken({
      roleArn: s3config.awsAssumeRoleArn,
      clientConfig: {
        region: s3config.region,
      },
      webIdentityToken,
    });
  }
  if (s3config.awsAssumeRoleArn !== undefined) {
    return fromTemporaryCredentials({
      params: {
        RoleArn: s3config.awsAssumeRoleArn,
        DurationSeconds: 900,
      },
      masterCredentials: {
        accessKeyId: s3config.accessKey ?? '',
        secretAccessKey: s3config.secretKey ?? '',
      },
      clientConfig: {
        region: s3config.region,
      },
    });
  }
  return {
    accessKeyId: s3config.accessKey ?? '',
    secretAccessKey: s3config.secretKey ?? '',
  };
};

export const getS3Client = (s3config: S3Config) => new S3Client({
  credentials: getAWSCredentials(s3config),
  endpoint: s3config.endPoint,
  forcePathStyle: true,
  region: s3config.region,
});

export const getPresignS3Client = (s3config: S3Config) => getS3Client({
  ...s3config,
  ...(s3config.presignEndPoint ? {
    endPoint: s3config.presignEndPoint,
  } : {}),
});

export type S3File = {
  Bucket: string,
  Key: string,
};

export const constructEPPS3File = (filename: string): S3File => ({
  Bucket: config.eppBucketName,
  Key: `${config.eppBucketPrefix}${filename}`,
});

export const getPresignedDownloadUrl = async (client: S3Client, file: S3File): Promise<string> => getSignedUrl(client, new GetObjectCommand(file), { expiresIn: 3600 });
