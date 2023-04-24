import request from 'supertest';
import { v4 } from 'uuid';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
//
import { app } from '../../config/app';
import { signup } from '../setup';
let cookie: string[] = [];

const filepath = path.join(__dirname, '172bytes.png');
const _172bytesFile = fs.readFileSync(filepath);
const userId = '643526c1405244812aa1918a';

beforeEach(async () => {
  const { cookie: newCookie } = await signup({
    role: 'admin',
    _id: userId,
  });
  cookie = newCookie;
});

async function uploadFile() {
  const { body } = await request(app)
    .post('/api/files/presigned-url')
    .send({
      type: 'image/png',
      size: 172,
    })
    .set('Cookie', cookie)
    .expect(201);

  console.log(body.data);

  // try to upload file
  let res: any;
  try {
    res = await axios({
      method: 'PUT',
      url: body.data.url,
      data: _172bytesFile,
    });
  } catch (error) {
    res = error;
    console.log(error);
  }

  expect(res.request.path).toContain(userId);

  return body.data.key;
}

async function getManyFiles(limit = 2, startAfter = '') {
  const { body } = await request(app)
    .get(`/api/files?limit=${limit}&prefix=${userId}&startAfter=${startAfter}`)
    .send({
      type: 'image/png',
      size: 172,
    })
    .set('Cookie', cookie)
    .expect(200);

  return body;
}

async function deleteFile(filename: string) {
  const { body } = await request(app)
    .delete(`/api/files/delete-one-file?key=${userId}/${filename}`)
    .set('Cookie', cookie)
    .expect(200);

  return body;
}

async function deleteManyFiles(filenames: string[]) {
  const { body } = await request(app)
    .delete('/api/files')
    .send({ deleteList: filenames })
    .set('Cookie', cookie)
    .expect(200);

  return body;
}

// failed because of cors
it.skip('CRUD with file', async () => {
  const file1 = await uploadFile();
  const file2 = await uploadFile();

  // get many
  let files;
  files = await getManyFiles();
  expect(files.isTruncated).toEqual(false);
  expect(files.results).toEqual(2);

  // get many with truncate
  const file3 = await uploadFile();
  files = await getManyFiles();
  expect(files.isTruncated).toEqual(true);

  // get the next page
  files = await getManyFiles(2, files.lastKey);
  expect(files.isTruncated).toEqual(false);
  expect(files.results).toEqual(1);

  files = await getManyFiles(2, files.lastKey);
  expect(files.results).toEqual(0);

  // delete file
  await deleteFile(file1);
  files = await getManyFiles();
  expect(files.results).toEqual(2);
  expect(files.isTruncated).toEqual(false);

  // deletemanyfile
  const body = await deleteManyFiles([file2, file3]);

  files = await getManyFiles();
  expect(files.results).toEqual(0);

  // delete non-exist files
  await deleteFile('filesss');
  await deleteManyFiles([`dddddd`, `sssspng`]);
});
