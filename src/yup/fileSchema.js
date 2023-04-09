const { object, string, number } = require('yup');

const MAX_IMAGE_SIZE = process.env.MAX_IMAGE_SIZE || 1;
const MAX_VIDEO_SIZE = process.env.MAX_VIDEO_SIZE || 50;

const fileSchema = object({
  body: object({
    type: string()
      .oneOf([
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/bmp',
        'video/mp4',
        'video/quicktime',
        'video/x-ms-wmv',
        'video/x-msvideo',
        'video/mpeg',
      ])
      .label('File type'),
    size: number()
      .required()
      .min(1)
      .label('File size')
      .when('type', {
        is: (type) => type.startsWith('image'),
        then: (schema) =>
          schema.max(
            MAX_IMAGE_SIZE * 1024 * 1024,
            `Image size should less than ${MAX_IMAGE_SIZE}mb`,
          ),
        otherwise: (schema) =>
          schema.max(
            MAX_VIDEO_SIZE * 1024 * 1024,
            `Video size should less than ${MAX_VIDEO_SIZE}mb`,
          ),
      }),
  }),
});

module.exports = fileSchema;
