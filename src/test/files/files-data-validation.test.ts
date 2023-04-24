import request from 'supertest';
import { app } from '../../config/app';
import { signup } from '../setup';
import { validFilesData } from './utils';

let cookie: string[] = [];

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

let invalidData = [
  {
    field: 'type',
    message:
      'File type must be one of the following values: image/jpeg, image/png, image/webp, image/gif, image/bmp, video/mp4, video/quicktime, video/x-ms-wmv, video/x-msvideo, video/mpeg',
    type: 'audio/mp3',
  },
  {
    field: 'size',
    message: 'File size must be greater than 0',
    type: 'image/jpeg',
    size: -100,
  },
  {
    field: 'size',
    message: 'Image size should be smaller than 1mb',
    type: 'image/jpeg',
    size: 1.01 * 1024 * 1024,
  },
  {
    field: 'size',
    message: 'File size must be greater than 0',
    type: 'video/mp4',
    size: -100,
  },
  {
    field: 'size',
    message: 'Video size should be smaller than 50mb',
    type: 'video/mp4',
    size: 50.1 * 1024 * 1024,
  },
];

// ==============================================================
describe.each(invalidData)(
  'invalid $field',
  ({ field, message, ...invalidData }) => {
    it(`shoud fail to create presigned url because ${message}`, async () => {
      const response = await request(app)
        .post(`/api/files/presigned-url`)
        .send({
          ...validFilesData,
          ...invalidData,
        })
        .set('Cookie', cookie)
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
      expect(response.body.errors).toContain(message);
    });
  },
);
