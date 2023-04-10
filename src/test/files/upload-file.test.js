/**
 * This test is not api route test!
 * I wrote this test to make sure that aws s3 functions as expect when user upload file to aws
 */
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { v4 } = require('uuid');
const { getPresignedUrl } = require('../../config/s3');
//

jest.mock('uuid');
beforeAll(() => {
  v4.mockReturnValue('test_name');
});

const filepath = path.join(__dirname, '172bytes.png');
const _172bytesFile = fs.readFileSync(filepath);

describe.skip('upload file', () => {
  it('should successfully upload file if file type, size are correct & link not expired', async () => {
    const url = await getPresignedUrl('test', 'image/png', 172, 3600);

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

    expect(res.status).toEqual(200);
  });

  it('should not upload file if file size is larger than expected', async () => {
    const url = await getPresignedUrl('test', 'image/png', 160, 3600);

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
    const url = await getPresignedUrl('test', 'image/png', 180, 3600);

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
    const url = await getPresignedUrl('test', 'image/png', 170, 3600);

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
    const url = await getPresignedUrl('test', 'image/png', 172, 0);

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
