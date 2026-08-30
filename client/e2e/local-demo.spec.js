const { test, expect } = require('@playwright/test');
const path = require('path');

const appraisalRoutes = [
  '/appraisal/demo-appraisal/upload',
  '/appraisal/demo-appraisal/general',
  '/appraisal/demo-appraisal/tenants',
  '/appraisal/demo-appraisal/tenants/rent_roll',
  '/appraisal/demo-appraisal/tenants/leasing_costs',
  '/appraisal/demo-appraisal/tenants/vacancy_schedule',
  '/appraisal/demo-appraisal/tenants/market_rents',
  '/appraisal/demo-appraisal/tenants/recovery_structures',
  '/appraisal/demo-appraisal/expenses',
  '/appraisal/demo-appraisal/comparable_sales',
  '/appraisal/demo-appraisal/comparable_sales/appraisal_caprate',
  '/appraisal/demo-appraisal/comparable_sales/appraisal_dca',
  '/appraisal/demo-appraisal/comparable_sales/database',
  '/appraisal/demo-appraisal/comparable_leases',
  '/appraisal/demo-appraisal/comparable_leases/appraisal',
  '/appraisal/demo-appraisal/comparable_leases/database',
  '/appraisal/demo-appraisal/stabilized_statement_valuation',
  '/appraisal/demo-appraisal/direct_comparison_valuation',
  '/appraisal/demo-appraisal/capitalization_valuation',
  '/appraisal/demo-appraisal/additional_income',
  '/appraisal/demo-appraisal/amortization',
  '/appraisal/demo-appraisal/discounted_cash_flow',
  '/appraisal/demo-appraisal/files/demo-financial-statement/annotate',
];

test('local no-login demo lists its seeded appraisal', async ({ page }) => {
  const response = await page.goto('/appraisals/');
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByText('Harbour Centre Demo')).toBeVisible();
  await expect(page.getByText('View All Appraisals')).toBeVisible();
});

test('application shell assets load from nested routes', async ({ page }) => {
  await page.goto('/appraisal/demo-appraisal/general');
  const shellImages = page.locator('img[alt="Swiftly"], img[alt="Avatar"]');
  await expect(shellImages).toHaveCount(3);
  expect(await shellImages.evaluateAll(images => images.map(image => image.complete && image.naturalWidth > 0))).toEqual([true, true, true]);
});

test('seeded detailed appraisal exposes its complete navigation', async ({ page }) => {
  await page.goto('/appraisal/demo-appraisal/general');
  for (const label of ['Tenants', 'Expenses', 'Additional Income', 'Amortization Schedule']) {
    await expect(page.getByRole('link', { name: label, exact: true })).toBeVisible();
  }
});

test('appraisal breadcrumb returns to the correct upload route', async ({ page }) => {
  await page.goto('/appraisal/demo-appraisal/general');
  await page.locator('.breadcrumb').getByRole('link', { name: 'Harbour Centre Demo' }).click();
  await expect(page).toHaveURL(/\/appraisal\/demo-appraisal\/upload$/);
});

test('seeded dates and discounted cash-flow year headings are visible', async ({ page }) => {
  await page.goto('/appraisal/demo-appraisal/general');
  await expect(page.locator('input[type="date"]')).toHaveValue('2026-01-01');

  await page.goto('/appraisal/demo-appraisal/discounted_cash_flow');
  const years = await page.locator('#view-discounted-cash-flow th[scope="col"]').allTextContents();
  expect(years.length).toBeGreaterThan(1);
  expect(years.every(year => /^\d{4}$/.test(year.trim()))).toBeTruthy();
});

test('mobile dashboard has an accessible navigation toggle without page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/appraisals/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const toggle = page.locator('.sidebar-toggle');
  await expect(toggle).toHaveAttribute('aria-label', 'Toggle navigation');
  await toggle.click();
  await expect(page.locator('body')).toHaveClass(/aside-toggled/);
  await expect(page.getByRole('link', { name: 'Start an Appraisal' })).toBeVisible();
});

test('create and delete appraisal flow persists through the local API', async ({ page }) => {
  const name = `Browser appraisal ${Date.now()}`;
  await page.goto('/appraisal/new');
  await page.getByText('Start A Short Appraisal').click();
  await page.getByPlaceholder('Name').fill(name);
  await page.getByPlaceholder('Address').fill('99 Browser Test Way');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page).toHaveURL(/\/appraisal\/[\w-]+\/upload/);

  await page.goto('/appraisals/');
  const row = page.locator('tr', { hasText: name });
  await expect(row).toBeVisible();
  await expect(row).toContainText('99 Browser Test Way');
  page.once('dialog', dialog => dialog.accept());
  await row.locator('button[title="Delete Appraisal"]').click();
  await expect(row).toHaveCount(0);
});

test('upload and remove a document through the browser', async ({ page }) => {
  await page.goto('/appraisal/demo-appraisal/upload');
  const upload = page.locator('input[type="file"]');
  const rows = page.locator('tr', { hasText: 'financial-statement.pdf' });
  const initialCount = await rows.count();
  await upload.setInputFiles(path.resolve(__dirname, '../../api/fixtures/financial-statement.pdf'));
  await expect(rows).toHaveCount(initialCount + 1);
  const row = rows.last();
  await expect(row).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await row.getByRole('button', { name: 'Remove' }).click();
  await expect(rows).toHaveCount(initialCount);
});

for (const route of appraisalRoutes) {
  test(`appraisal workflow route renders without browser errors: ${route}`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text());
    });
    const response = await page.goto(route);
    expect(response?.ok()).toBeTruthy();
    await page.waitForTimeout(250);
    expect(errors).toEqual([]);
    await expect(page.locator('#app')).not.toBeEmpty();
  });
}
