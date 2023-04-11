const {
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4 } = require('uuid');
const { bucket, client } = require('../config/s3');

const createPresignedUrl = async (req, res, next) => {
  const { type, size } = req.body;
  const { url, key } = await generateUrl(req.user._id, type, size, 10);
  res.status(201).json({ status: 'success', data: { url, key } });
};

const generateUrl = async (
  userid,
  contentType,
  contentLength,
  expiresIn = 10,
) => {
  const extension = contentType.split('/')[1];
  const keyname = 4828204800000 - Number(Date.now());
  const key = `${userid}/${keyname}-${v4().slice(13)}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentLength: contentLength,
    ContentType: contentType,
  });

  const url = await getSignedUrl(client, command, {
    expiresIn: process.env.PRESIGNED_URL_EXPIRES_IN || expiresIn,
  });

  return { url, key };
};

const getManyFiles = async (req, res, next) => {
  const { limit = 20, startAfter, prefix } = req.query;

  const command = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: prefix,
    MaxKeys: limit > 100 ? 20 : limit,
    StartAfter: startAfter ? startAfter : undefined,
    Sort: 'last_modified',
  });

  const { Contents = [], IsTruncated } = await client.send(command);

  let lastKey;

  if (Contents.length > 0) {
    lastKey = Contents[Contents.length - 1].Key;
  }

  res.status(200).json({
    status: 'success',
    isTruncated: IsTruncated,
    results: Contents.length,
    lastKey,
    data: Contents,
  });
};

const deleteFile = async (req, res, next) => {
  const key = req.query.key;

  if (!key) {
    res.status(400).json({
      status: 'fail',
      message: 'Please include filename in query string',
    });
    return;
  }

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  await client.send(command);
  res.status(200).json({ status: 'success' });
};

const deleteManyFiles = async (req, res, next) => {
  const deleteList = req.body.deleteList;
  const objects = deleteList.map((key) => ({ Key: key }));

  const command = new DeleteObjectsCommand({
    Bucket: bucket,
    Delete: {
      Objects: objects,
    },
  });

  const { Deleted } = await client.send(command);

  res
    .status(200)
    .json({ status: 'success', message: `Deleted ${Deleted.length} files!` });
};

const filesController = {
  createPresignedUrl,
  deleteFile,
  deleteManyFiles,
  getManyFiles,
  //
  generateUrl,
};

module.exports = filesController;
