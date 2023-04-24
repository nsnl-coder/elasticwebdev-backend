// handle side-effect when delete product or delete many products
let cookie = '';
beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

describe('handle side effect', () => {
  it.todo('should ... effect when delete product');
  it.todo('should .... effect when delete many products');
});
