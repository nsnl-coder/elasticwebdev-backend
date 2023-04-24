import request from "supertest";;
import fs from "fs";;
import path from "path";;
import axios from "axios";;
//
import { validFilesData } from "./utils";;
import { app } from "../../config/app";;
import { generateUrl } from "../../controllers/fileController";;

const filepath = path.join(__dirname, '172bytes.png');
const _172bytesFile = fs.readFileSync(filepath);
let cookie = '';

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

describe.skip('failed to upload file', () => {
  it('should not upload file if file size is larger than expected', async () => {
    const { url } = await generateUrl('test', 'image/png', 160, 3600);

    let res;
    try {
      res = await axios({
        method: 'PUT',
        url,
        data: _172bytesFile,
        header: {
          'Content-Type': 'image/png',
        },
      });
    } catch (error) {
      res = error;
    }

    expect(res.message).toEqual('Request failed with status code 403');
  });

  it('should not upload file if file size is smaller than expected', async () => {
    const { url } = await generateUrl('test', 'image/png', 180, 3600);

    let res;
    try {
      res = await axios({
        method: 'PUT',
        url,
        data: _172bytesFile,
        header: {
          'Content-Type': 'image/png',
        },
      });
    } catch (error) {
      res = error;
    }

    expect(res.message).toEqual('Request failed with status code 403');
  });

  it('should not upload file if file type is not correct', async () => {
    const { url } = await generateUrl('test', 'image/png', 170, 3600);

    let res;
    try {
      res = await axios({
        method: 'PUT',
        url,
        data: _172bytesFile,
        header: {
          'Content-Type': 'video/mp4',
        },
      });
    } catch (error) {
      res = error;
    }

    expect(res.message).toEqual('Request failed with status code 403');
  });

  it('should not upload file if presigned url expired', async () => {
    const { url } = await generateUrl('test', 'image/png', 172, 0);

    let res;
    try {
      res = await axios({
        method: 'PUT',
        url,
        data: _172bytesFile,
        header: {
          'Content-Type': 'image/png',
        },
      });
    } catch (error) {
      res = error;
    }
    expect(res.message).toEqual('Request failed with status code 403');
  });
});

it.each(['type', 'size'])('return error if %s is missing', async (field) => {
  const { body } = await request(app)
    .post('/api/files/presigned-url')
    .send({
      validFilesData,
      [field]: undefined,
    })
    .set('Cookie', cookie)
    .expect(400);

  // also check if it return correct message
  expect(body.errors).toContain(`${field} is required`);
});

describe('auth check', () => {
  it('should return error if user is not logged in', async () => {
    cookie = '';
    const response = await request(app)
      .post('/api/files/presigned-url')
      .send(validFilesData)
      .set('Cookie', cookie)
      .expect(401);

    expect(response.body.message).toBe(
      'You are not logged in! Please logged in to perform the action',
    );
  });

  it('should return error if user is not verified', async () => {
    const { cookie } = await signup({
      isVerified: false,
      email: 'test2@test.com',
    });

    const response = await request(app)
      .post('/api/files/presigned-url')
      .send(validFilesData)
      .set('Cookie', cookie)
      .expect(401);

    expect(response.body.message).toEqual(
      'Please verified your email to complete this action!',
    );
  });

  it('should return error if user is not admin', async () => {
    const { cookie } = await signup({
      email: 'test2@test.com',
    });

    const response = await request(app)
      .post('/api/files/presigned-url')
      .send(validFilesData)
      .set('Cookie', cookie)
      .expect(403);

    expect(response.body.message).toEqual(
      'You do not have permission to perform this action',
    );
  });
});
