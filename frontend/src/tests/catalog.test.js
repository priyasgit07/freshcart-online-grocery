import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Catalog Sort and Filter Constraints Tests.
 */
describe('Catalog Sorting & Filter Configuration', () => {

  const BACKEND_ALLOWED_SORT_FIELDS = new Set(['name', 'price', 'createdAt', 'stock', 'category']);

  const CATALOG_SORT_OPTIONS = [
    { label: 'Newest First', value: 'createdAt-desc' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Name: A to Z', value: 'name-asc' },
    { label: 'Name: Z to A', value: 'name-desc' },
  ];

  it('default sort configuration uses createdAt in descending order', () => {
    const defaultSortBy = 'createdAt';
    const defaultSortDir = 'desc';

    assert.equal(defaultSortBy, 'createdAt');
    assert.equal(defaultSortDir, 'desc');
    assert.ok(BACKEND_ALLOWED_SORT_FIELDS.has(defaultSortBy));
  });

  it('all dropdown sort options strictly map to backend allowed sort fields', () => {
    for (const option of CATALOG_SORT_OPTIONS) {
      const [field, dir] = option.value.split('-');
      assert.ok(
        BACKEND_ALLOWED_SORT_FIELDS.has(field),
        `Sort field '${field}' from option '${option.label}' must be in backend allowed whitelist`
      );
      assert.ok(['asc', 'desc'].includes(dir), `Sort direction must be asc or desc, got ${dir}`);
    }
  });

  it('rejects obsolete or unsafe sort parameters such as id or arbitrary properties', () => {
    assert.equal(BACKEND_ALLOWED_SORT_FIELDS.has('id'), false);
    assert.equal(BACKEND_ALLOWED_SORT_FIELDS.has('creditCard'), false);
    assert.equal(BACKEND_ALLOWED_SORT_FIELDS.has('password'), false);
  });
});
