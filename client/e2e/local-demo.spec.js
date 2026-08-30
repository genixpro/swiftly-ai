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
    const response = await page.goto(route);
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator('#app')).not.toBeEmpty();
    await expect(page.getByText('Harbour Centre Demo').first()).toBeVisible();
    await page.waitForTimeout(250);
    expect(errors).toEqual([]);
  });
}
