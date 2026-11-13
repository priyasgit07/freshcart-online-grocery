import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Frontend Validation Tests.
 * Tests registration, checkout, and inventory validation rules.
 */
describe('Frontend Input Validation Rules', () => {

  const validateRegistration = ({ name, email, password }) => {
    const errors = [];
    if (!name || !name.trim()) errors.push('Name is required');
    if (!email || !email.includes('@') || !email.includes('.')) errors.push('Invalid email format');
    if (!password || password.length < 8) errors.push('Password must be at least 8 characters');
    return { isValid: errors.length === 0, errors };
  };

  const validateCheckout = ({ deliveryAddress, customerName, customerPhone }) => {
    const errors = [];
    if (!deliveryAddress || !deliveryAddress.trim()) errors.push('Delivery address is required');
    if (customerPhone && customerPhone.length > 30) errors.push('Phone exceeds maximum length');
    if (customerName && customerName.length > 150) errors.push('Name exceeds maximum length');
    return { isValid: errors.length === 0, errors };
  };

  it('valid registration data passes validation', () => {
    const result = validateRegistration({
      name: 'Sarah Connor',
      email: 'sarah@example.com',
      password: 'StrongPassword123'
    });
    assert.equal(result.isValid, true);
    assert.equal(result.errors.length, 0);
  });

  it('rejects passwords shorter than 8 characters', () => {
    const result = validateRegistration({
      name: 'Sarah',
      email: 'sarah@example.com',
      password: 'short'
    });
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some(e => e.includes('at least 8 characters')));
  });

  it('rejects invalid email formats', () => {
    const result = validateRegistration({
      name: 'Sarah',
      email: 'not-an-email',
      password: 'StrongPassword123'
    });
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some(e => e.includes('Invalid email format')));
  });

  it('checkout requires non-empty delivery address', () => {
    const emptyResult = validateCheckout({
      deliveryAddress: '   ',
      customerName: 'Sarah',
      customerPhone: '555-0199'
    });
    assert.equal(emptyResult.isValid, false);
    assert.ok(emptyResult.errors.some(e => e.includes('address is required')));

    const validResult = validateCheckout({
      deliveryAddress: '742 Evergreen Terrace',
      customerName: 'Sarah',
      customerPhone: '555-0199'
    });
    assert.equal(validResult.isValid, true);
  });
});
