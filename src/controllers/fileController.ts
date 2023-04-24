import {
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 } from 'uuid';
import getS3Client from '../config/s3';
import { NextFunction, Request, Response } from 'express';
import { ReqQuery } from '../types/express';

const createPresignedUrl = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { type, size } = req.body;
  const { url, key } = await generateUrl(req.user._id, type, size, 10);
  res.status(201).json({ status: 'success', data: { url, key } });
};

const generateUrl = async (
  userid: string,
  contentType: string,
  contentLength: number,
  expiresIn = 10,
) => {
  const extension = contentType.split('/')[1];
  const keyname = 4828204800000 - Number(Date.now());
  const key = `${userid}/${keyname}-${v4().slice(13)}.${extension}`;
  const s3 = getS3Client();

  if (!s3) {
    throw Error('Something went wrong!');
  }

  const command = new PutObjectCommand({
    Bucket: s3.bucket,
    Key: key,
    ContentLength: contentLength,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3.client, command, {
    expiresIn: Number(process.env.PRESIGNED_URL_EXPIRES_IN) || expiresIn,
  });

  return { url, key };
};

const getManyFiles = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { limit = 20, startAfter, prefix } = req.query as ReqQuery;
  const s3 = getS3Client();

  if (!s3) {
    throw Error('Something went wrong!');
  }

  const command = new ListObjectsV2Command({
    Bucket: s3.bucket,
    Prefix: prefix,
    MaxKeys: limit > 100 ? 20 : limit,
    StartAfter: startAfter ? startAfter : undefined,
    // Sort: 'last_modified',
  });

  const { Contents = [], IsTruncated } = await s3.client.send(command);

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

const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
  const key = req.query.key;
  const s3 = getS3Client();

  if (!s3) {
    throw Error('Something went wrong!');
  }

  if (!key) {
    res.status(400).json({
      status: 'fail',
      message: 'Please include filename in query string',
    });
    return;
  }

  const command = new DeleteObjectCommand({
    Bucket: s3.bucket,
    Key: key,
  });

  await s3.client.send(command);
  res.status(200).json({ status: 'success' });
};

const deleteManyFiles = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const deleteList = req.body.deleteList;
  const objects = deleteList.map((key: string) => ({ Key: key }));

  const s3 = getS3Client();

  if (!s3) {
    throw Error('Something went wrong!');
  }

  const command = new DeleteObjectsCommand({
    Bucket: s3.bucket,
    Delete: {
      Objects: objects,
    },
  });

  const { Deleted = [] } = await s3.client.send(command);

  res
    .status(200)
    .json({ status: 'success', message: `Deleted ${Deleted.length} files!` });
};

export {
  createPresignedUrl,
  deleteFile,
  deleteManyFiles,
  getManyFiles,
  //
  generateUrl,
};
