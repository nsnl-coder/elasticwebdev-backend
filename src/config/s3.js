const { S3Client } = require('@aws-sdk/client-s3');
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

module.exports = { client, bucket };
