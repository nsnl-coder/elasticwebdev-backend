import { signup } from '../setup';

// handle side-effect when delete coupon or delete many coupons
let cookie: string[] = [];
beforeEach(async () => {
  const { cookie: newCookie } = await signup({ role: 'admin' });
  cookie = newCookie;
});

describe('handle side effect', () => {
  it.todo('should ... effect when delete coupon');
  it.todo('should .... effect when delete many coupons');
});
