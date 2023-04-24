import { signup } from '../setup';

// handle side-effect when delete menu or delete many menus
let cookie: string[] = [];

beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

describe('handle side effect', () => {
  it.todo('should ... effect when delete menu');
  it.todo('should .... effect when delete many menus');
});
