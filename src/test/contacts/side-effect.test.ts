import { signup } from '../setup';

// handle side-effect when delete contact or delete many contacts
let cookie: string[] = [];
beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

describe('handle side effect', () => {
  it.todo('should ... effect when delete contact');
  it.todo('should .... effect when delete many contacts');
});
