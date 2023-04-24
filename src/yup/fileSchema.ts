import { object, string, number, array, InferType } from 'yup';

const MAX_IMAGE_SIZE = Number(process.env.MAX_IMAGE_SIZE || 1);
const MAX_VIDEO_SIZE = Number(process.env.MAX_VIDEO_SIZE || 50);

const reqBody = object({
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
    .moreThan(0)
    .label('File size')
    .when('type', {
      is: (type: string) => type && type.startsWith('image'),
      then: (schema) =>
        schema.max(
          MAX_IMAGE_SIZE * 1024 * 1024,
          `Image size should be smaller than ${MAX_IMAGE_SIZE}mb`,
        ),
      otherwise: (schema) =>
        schema.max(
          MAX_VIDEO_SIZE * 1024 * 1024,
          `Video size should be smaller than ${MAX_VIDEO_SIZE}mb`,
        ),
    }),
  deleteList: array().of(string()).min(1),
});

const fileSchema = object({
  body: reqBody,
});

interface IFile extends InferType<typeof reqBody> {}

export default fileSchema;
export type { IFile };
