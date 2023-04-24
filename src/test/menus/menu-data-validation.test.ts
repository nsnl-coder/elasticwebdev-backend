import request from 'supertest';
import { createMenu, validMenuData } from './utils';
import { app } from '../../config/app';
import { signup } from '../setup';
let cookie: string[] = [];

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

let invalidData = [
  {
    field: 'ordering',
    message:
      'ordering must be a `number` type, but the final value was: `NaN` (cast from the value `"invalid"`).',
    ordering: 'invalid',
  },
  {
    field: 'ordering',
    message: 'ordering must be less than or equal to 9999',
    ordering: 10000,
  },
  {
    field: 'name',
    message: 'name must be at most 255 characters',
    name: 's'.repeat(256),
  },
  {
    field: 'childMenus',
    message: 'Invalid ObjectId',
    childMenus: ['das-sda-as-dssscxz'],
  },
];

// ==============================================================
describe.each(invalidData)(
  'invalid $field',
  ({ field, message, ...invalidData }) => {
    it(`shoud fail to create menu because ${message}`, async () => {
      const response = await request(app)
        .post(`/api/menus`)
        .send({
          ...validMenuData,
          ...invalidData,
        })
        .set('Cookie', cookie)
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
      expect(response.body.errors).toContain(message);
    });

    it(`should fail to update menu because ${message}`, async () => {
      const menu = await createMenu();
      const response = await request(app)
        .put(`/api/menus/${menu._id}`)
        .send({
          ...validMenuData,
          ...invalidData,
        })
        .set('Cookie', cookie)
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
      expect(response.body.errors).toContain(message);
    });

    it(`shoud fail to update many menus because ${message}`, async () => {
      let menu1 = await createMenu();
      let menu2 = await createMenu();

      const response = await request(app)
        .put('/api/menus')
        .set('Cookie', cookie)
        .send({
          updateList: [menu1._id, menu2._id],
          ...validMenuData,
          ...invalidData,
        })
        .expect(400);

      expect(response.body.message).toEqual('Data validation failed');
      expect(response.body.errors).toContain(message);
    });
  },
);
