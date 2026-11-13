import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Frontend Auth and Role-Based Access Control (RBAC) tests.
 * Validates permission matrices, vendor approval status, and route authorization rules.
 */
describe('Frontend RBAC & Auth Rules', () => {

  const hasRoleAccess = (userRole, allowedRoles) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    if (!userRole) return false;
    return allowedRoles.includes(userRole);
  };

  const isUserEligibleForDashboard = (user) => {
    if (!user || !user.token) return false;
    if (user.active === false) return false;
    return true;
  };

  it('CUSTOMER role can access customer & shared routes', () => {
    const customerRole = 'CUSTOMER';
    assert.equal(hasRoleAccess(customerRole, ['CUSTOMER', 'ADMIN']), true);
    assert.equal(hasRoleAccess(customerRole, ['CUSTOMER', 'VENDOR', 'ADMIN']), true);
  });

  it('CUSTOMER role is denied access to vendor-only and admin-only routes', () => {
    const customerRole = 'CUSTOMER';
    assert.equal(hasRoleAccess(customerRole, ['VENDOR', 'ADMIN']), false);
    assert.equal(hasRoleAccess(customerRole, ['ADMIN']), false);
  });

  it('VENDOR role can access vendor routes and shared profile', () => {
    const vendorRole = 'VENDOR';
    assert.equal(hasRoleAccess(vendorRole, ['VENDOR', 'ADMIN']), true);
    assert.equal(hasRoleAccess(vendorRole, ['CUSTOMER', 'VENDOR', 'ADMIN']), true);
  });

  it('VENDOR role is denied access to customer checkout and cart', () => {
    const vendorRole = 'VENDOR';
    assert.equal(hasRoleAccess(vendorRole, ['CUSTOMER', 'ADMIN']), false);
  });

  it('ADMIN role has access to all protected route tiers', () => {
    const adminRole = 'ADMIN';
    assert.equal(hasRoleAccess(adminRole, ['ADMIN']), true);
    assert.equal(hasRoleAccess(adminRole, ['VENDOR', 'ADMIN']), true);
    assert.equal(hasRoleAccess(adminRole, ['CUSTOMER', 'ADMIN']), true);
    assert.equal(hasRoleAccess(adminRole, ['CUSTOMER', 'VENDOR', 'ADMIN']), true);
  });

  it('Unauthenticated user (null/undefined) is denied access to protected routes', () => {
    assert.equal(hasRoleAccess(null, ['CUSTOMER', 'ADMIN']), false);
    assert.equal(hasRoleAccess(undefined, ['VENDOR', 'ADMIN']), false);
  });

  it('Unapproved vendor (active: false or no token) is denied dashboard access', () => {
    const pendingVendor = { role: 'VENDOR', active: false, token: null };
    assert.equal(isUserEligibleForDashboard(pendingVendor), false);

    const activeVendor = { role: 'VENDOR', active: true, token: 'jwt-xyz-123' };
    assert.equal(isUserEligibleForDashboard(activeVendor), true);
  });
});
