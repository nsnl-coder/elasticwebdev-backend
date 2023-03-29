const express = require('express');
const AWS = require('aws-sdk');
const { v4 } = require('uuid');

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
});

const router = express.Router();

router.get('/', async (req, res, next) => {
  const key = `this-is-some-test/${v4()}.jpeg`;

  const url = s3.getSignedUrl('putObject', {
    Bucket: process.env.S3_BUCKET_NAME,
    ContentType: 'image/jpeg',
    Key: key,
  });

  res.send({ key, url });
});

module.exports = router;
