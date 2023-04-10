// handle side-effect when delete order or delete many orders
let cookie = '';
beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

describe('handle side effect', () => {
  it.todo('should ... effect when delete order');
  it.todo('should .... effect when delete many orders');
});
