import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Frontend Cart & Order State Calculations.
 */
describe('Cart & Order State Calculations', () => {

  const calculateCartSummary = (items) => {
    let totalItems = 0;
    let totalPrice = 0;
    for (const item of items) {
      totalItems += item.quantity;
      totalPrice += Number(item.price) * item.quantity;
    }
    const deliveryFee = 0; // COD free delivery
    const totalDue = totalPrice + deliveryFee;
    return {
      totalItems,
      totalPrice: Number(totalPrice.toFixed(2)),
      deliveryFee,
      totalDue: Number(totalDue.toFixed(2)),
    };
  };

  const getNextAllowedVendorStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'PENDING': return 'CONFIRMED';
      case 'CONFIRMED': return 'SHIPPED';
      case 'SHIPPED': return 'DELIVERED';
      default: return null;
    }
  };

  it('calculates totals for multiple grocery items correctly', () => {
    const items = [
      { id: 1, name: 'Fresh Apples', price: 3.49, quantity: 2 },
      { id: 2, name: 'Organic Milk', price: 4.29, quantity: 1 },
      { id: 3, name: 'Sourdough Bread', price: 4.50, quantity: 3 },
    ];
    // (3.49 * 2 = 6.98) + (4.29 * 1 = 4.29) + (4.50 * 3 = 13.50) = 24.77
    const summary = calculateCartSummary(items);
    assert.equal(summary.totalItems, 6);
    assert.equal(summary.totalPrice, 24.77);
    assert.equal(summary.deliveryFee, 0);
    assert.equal(summary.totalDue, 24.77);
  });

  it('handles empty cart without NaN or errors', () => {
    const summary = calculateCartSummary([]);
    assert.equal(summary.totalItems, 0);
    assert.equal(summary.totalPrice, 0);
    assert.equal(summary.totalDue, 0);
  });

  it('enforces status sequence PENDING -> CONFIRMED -> SHIPPED -> DELIVERED', () => {
    assert.equal(getNextAllowedVendorStatus('PENDING'), 'CONFIRMED');
    assert.equal(getNextAllowedVendorStatus('CONFIRMED'), 'SHIPPED');
    assert.equal(getNextAllowedVendorStatus('SHIPPED'), 'DELIVERED');
    assert.equal(getNextAllowedVendorStatus('DELIVERED'), null);
    assert.equal(getNextAllowedVendorStatus('CANCELLED'), null);
  });
});
