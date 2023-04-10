const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4 } = require('uuid');

//
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const bucket = process.env.S3_BUCKET_NAME;

const client = new S3Client({
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  region: 'us-east-1',
});

const getPresignedUrl = async (
  userid,
  contentType,
  contentLength,
  expiresIn = 3600,
) => {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: `${userid}/${v4()}`,
    ContentLength: contentLength,
    ContentType: contentType,
  });

  const url = await getSignedUrl(client, command, { expiresIn });
  return url;
};

module.exports = { getPresignedUrl };
