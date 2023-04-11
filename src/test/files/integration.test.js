const { app } = require('../../config/app');
const request = require('supertest');
const { v4 } = require('uuid');
const { default: axios } = require('axios');
const fs = require('fs');
const path = require('path');

let cookie = '';
jest.mock('uuid');

const filepath = path.join(__dirname, '172bytes.png');
const _172bytesFile = fs.readFileSync(filepath);
const userId = '643526c1405244812aa1918a';

beforeEach(async () => {
  const { cookie: newCookie } = await signup({
    role: 'admin',
    _id: userId,
  });
  cookie = newCookie;
  v4.mockReturnValue('test_name');
});

async function uploadFile(filename) {
  if (!filename) {
    console.log('Please include file name');
    return;
  }

  v4.mockReturnValue(filename);
  const { body } = await request(app)
    .post('/api/files/presigned-url')
    .send({
      type: 'image/png',
      size: 172,
    })
    .set('Cookie', cookie)
    .expect(201);

  // try to upload file
  let res;
  try {
    res = await axios({
      method: 'PUT',
      url: body.data,
      data: _172bytesFile,
      header: {
        'Content-Type': 'image/png',
      },
    });
  } catch (error) {
    res = error;
  }

  expect(res.request.path).toContain(userId);
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

async function deleteFile(filename) {
  const { body } = await request(app)
    .delete(`/api/files/delete-one-file?key=${userId}/${filename}`)
    .set('Cookie', cookie)
    .expect(200);

  return body;
}

async function deleteManyFiles(filenames) {
  const { body } = await request(app)
    .delete('/api/files')
    .send({ deleteList: filenames })
    .set('Cookie', cookie)
    .expect(200);

  return body;
}

it.skip('CRUD with file', async () => {
  await uploadFile('file1');
  await uploadFile('file2');

  // get many
  let files;
  files = await getManyFiles();
  expect(files.isTruncated).toEqual(false);
  expect(files.results).toEqual(2);

  // get many with truncate
  await uploadFile('file3');
  files = await getManyFiles();
  expect(files.isTruncated).toEqual(true);

  // get the next page
  files = await getManyFiles(2, files.lastKey);
  expect(files.isTruncated).toEqual(false);
  expect(files.results).toEqual(1);

  files = await getManyFiles(2, files.lastKey);
  expect(files.results).toEqual(0);

  // delete file
  await deleteFile('file3.png');
  files = await getManyFiles();
  expect(files.results).toEqual(2);
  expect(files.isTruncated).toEqual(false);

  // deletemanyfile
  const body = await deleteManyFiles([
    `${userId}/file1.png`,
    `${userId}/file2.png`,
  ]);

  files = await getManyFiles();
  expect(files.results).toEqual(0);

  // delete non-exist files
  await deleteFile('filesss');
  await deleteManyFiles([`dddddd`, `sssspng`]);
});
