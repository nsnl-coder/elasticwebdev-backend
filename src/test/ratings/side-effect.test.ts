// handle side-effect when delete rating or delete many ratings
let cookie = '';
beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

describe('handle side effect', () => {
  it.todo('should ... effect when delete rating');
  it.todo('should .... effect when delete many ratings');
});
