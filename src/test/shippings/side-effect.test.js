// handle side-effect when delete shipping or delete many shippings
let cookie = '';
beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

describe('handle side effect', () => {
  it.todo('should ... effect when delete shipping');
  it.todo('should .... effect when delete many shippings');
});
