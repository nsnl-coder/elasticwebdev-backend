import { S3Client } from '@aws-sdk/client-s3';

const getS3Client = (): { bucket: string; client: S3Client } | null => {
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const bucket = process.env.S3_BUCKET_NAME;

  if (!accessKeyId || !secretAccessKey) {
    console.log(
      'Can not read s3 accessKeyId and s3 secretAccessKey from .env file',
    );
    return null;
  }

  if (!bucket) {
    console.log('Can not read bucket name from .env file');
    return null;
  }

  const client = new S3Client({
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    region: 'us-east-1',
  });

  return { client, bucket };
};

export default getS3Client;
