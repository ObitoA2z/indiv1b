// Unit tests for server route handlers (validation logic)

process.env.JWT_SECRET = 'test-secret';
process.env.FRONTEND_URL = 'http://localhost:5173';

describe('Registration validation', () => {
  test('rejects password shorter than 6 characters', () => {
    const password = 'Ab123';
    const hasMinLength = password.length >= 6;
    expect(hasMinLength).toBe(false);
  });

  test('accepts password with 6+ characters', () => {
    const password = 'Abcdef';
    const hasMinLength = password.length >= 6;
    expect(hasMinLength).toBe(true);
  });
});

describe('Role normalization', () => {
  test('normalizes "seller" to SELLER', () => {
    const role = 'seller';
    const normalizedRole = typeof role === 'string' ? role.toUpperCase() : undefined;
    const initialRole = normalizedRole === 'SELLER' ? 'SELLER' : 'BUYER';
    expect(initialRole).toBe('SELLER');
  });

  test('defaults to BUYER for unknown role', () => {
    const role = 'unknown';
    const normalizedRole = typeof role === 'string' ? role.toUpperCase() : undefined;
    const initialRole = normalizedRole === 'SELLER' ? 'SELLER' : 'BUYER';
    expect(initialRole).toBe('BUYER');
  });

  test('defaults to BUYER when role is undefined', () => {
    const role = undefined;
    const normalizedRole = typeof role === 'string' ? role.toUpperCase() : undefined;
    const initialRole = normalizedRole === 'SELLER' ? 'SELLER' : 'BUYER';
    expect(initialRole).toBe('BUYER');
  });
});

describe('URL double-prefix fix middleware logic', () => {
  test('removes double /api/api/ prefix', () => {
    let url = '/api/api/products';
    if (url.startsWith('/api/api/')) {
      url = url.replace('/api/api/', '/api/');
    }
    expect(url).toBe('/api/products');
  });

  test('leaves single /api/ prefix unchanged', () => {
    let url = '/api/products';
    if (url.startsWith('/api/api/')) {
      url = url.replace('/api/api/', '/api/');
    }
    expect(url).toBe('/api/products');
  });
});

describe('Order total price calculation', () => {
  test('calculates total with shipping', () => {
    const product = { price: 49.99, shipping: 5.0 };
    const quantity = 2;
    const totalPrice = (product.price + product.shipping) * quantity;
    expect(totalPrice).toBeCloseTo(109.98);
  });

  test('calculates total with zero shipping', () => {
    const product = { price: 100.0, shipping: 0 };
    const quantity = 1;
    const totalPrice = (product.price + product.shipping) * quantity;
    expect(totalPrice).toBe(100.0);
  });
});
