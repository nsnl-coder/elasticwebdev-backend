// handle side-effect when delete contact or delete many contacts
let cookie = '';
beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

describe('handle side effect', () => {
  it.todo('should ... effect when delete contact');
  it.todo('should .... effect when delete many contacts');
});
