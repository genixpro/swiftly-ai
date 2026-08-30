const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

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

test('local demo shell omits retired template controls', async ({ page }) => {
  await page.goto('/appraisals/');
  await expect(page.getByRole('search')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Settings' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Log Out' })).toHaveCount(0);
});

test('missing appraisal shows a recoverable error instead of a blank shell', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/appraisal/does-not-exist/general');
  await expect(page.getByText('Appraisal unavailable')).toBeVisible();
  await expect(page.getByText("We couldn't find that appraisal. It may have been removed.")).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return to appraisals' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'General Information' })).toHaveCount(0);
  expect(errors).toEqual([]);
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

test('expenses shows the seeded financial statement preview', async ({ page }) => {
  await page.goto('/appraisal/demo-appraisal/expenses');
  const fileSelector = page.locator('.file-selector-row select');
  await expect(fileSelector).toHaveValue('demo-financial-statement');
  const preview = page.getByRole('img', { name: 'Document preview, page 1' });
  await expect(preview).toBeVisible();
  await expect.poll(() => preview.evaluate(image => image.complete && image.naturalWidth > 0)).toBeTruthy();
  await expect(page.getByText('Document preview unavailable')).toHaveCount(0);
});

test('seeded demo is complete and presents realistic financial inputs', async ({ page }) => {
  await page.goto('/appraisal/demo-appraisal/upload');
  await expect(page.locator('#appraisal-checklist .fa-check')).toHaveCount(14);
  await expect(page.locator('#appraisal-checklist .fa-times')).toHaveCount(0);

  await page.goto('/appraisal/demo-appraisal/expenses');
  for (const value of ['Repairs and maintenance', 'Utilities', 'Management fee', 'Property taxes']) {
    await expect(page.locator(`input[value="${value}"]`)).toBeVisible();
  }
  await expect(page.getByText('$105,000.00')).toBeVisible();

  await page.goto('/appraisal/demo-appraisal/additional_income');
  await expect(page.locator('input[value="Parking"]')).toBeVisible();
  await expect(page.getByText('$42,000.00')).toBeVisible();

  await page.goto('/appraisal/demo-appraisal/amortization');
  const seededRow = page.locator('tr', { has: page.locator('input[value="Tenant improvements"]') });
  await expect(seededRow.locator('input[placeholder="Amount"]')).toHaveValue('$18,000.00');
  await expect(seededRow.locator('input[placeholder="Period (months)"]')).toHaveValue('60 months');
  await expect(seededRow.locator('input[placeholder="Start Date"]')).toHaveValue('2026-01-01');
});

test('seeded occupancy and direct comparison calculations agree with the subject', async ({ page }) => {
  await page.goto('/appraisal/demo-appraisal/tenants/vacancy_schedule');
  await expect(page.locator('.progress-bar', { hasText: 'Occupied 2026 - 2029' })).toBeVisible();
  await expect(page.locator('.progress-bar', { hasText: 'Occupied 2026 - 2031' })).toBeVisible();
  await expect(page.getByText('Vacant 2026 - 2035')).toBeVisible();

  await page.goto('/appraisal/demo-appraisal/direct_comparison_valuation');
  await expect(page.getByText('Jan 2025')).toBeVisible();
  await expect(page.getByText('15,000 sqft @')).toBeVisible();
  await expect(page.getByText('$3,900,000.00').first()).toBeVisible();
  await expect(page.getByText('Final Value by Direct Comparison Approach')).toContainText('$3,900,000');
});

test('dense workflow screens remain usable on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto('/appraisal/new');
  await expect(page.getByText('Start a Short Appraisal')).toBeVisible();
  await expect(page.getByText('Start a Detailed Appraisal')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

  await page.goto('/appraisal/demo-appraisal/expenses');
  await expect(page.locator('[id="remove-year-expenseStatement-Operating-Expense-2026"]')).toHaveCount(1);
  const renderedIds = await page.locator('[id]').evaluateAll(elements => elements.map(element => element.id));
  expect(new Set(renderedIds).size).toBe(renderedIds.length);
  const statementScroller = page.locator('.income-statement-table-scroll').first();
  expect(await statementScroller.evaluate(element => element.scrollWidth > element.clientWidth)).toBeTruthy();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await expect(page.getByRole('img', { name: 'Document preview, page 1' })).toBeVisible();

  await page.goto('/appraisal/demo-appraisal/amortization');
  const amortizationScroller = page.locator('#view-amortization .table-responsive');
  expect(await amortizationScroller.evaluate(element => element.scrollWidth > element.clientWidth)).toBeTruthy();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

  await page.goto('/appraisal/demo-appraisal/general');
  const addressValueCell = page.locator('.property-information-fields-table tr', { hasText: 'Address' }).locator('td').nth(1);
  expect(await addressValueCell.evaluate(element => getComputedStyle(element).display)).toBe('block');
  expect(await addressValueCell.evaluate(element => element.getBoundingClientRect().width)).toBeGreaterThan(300);

  for (const route of ['direct_comparison_valuation', 'capitalization_valuation', 'stabilized_statement_valuation']) {
    await page.goto(`/appraisal/demo-appraisal/${route}`);
    const valuationScroller = page.locator('.valuation-table-scroll').first();
    expect(await valuationScroller.evaluate(element => element.scrollWidth)).toBeLessThanOrEqual(
      await valuationScroller.evaluate(element => element.clientWidth + 1)
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  }
});

test('selected comparable data is presentation-ready', async ({ page }) => {
  await page.goto('/appraisal/demo-appraisal/comparable_sales/appraisal_caprate');
  await expect(page.getByText('5.25%').first()).toBeVisible();
  await expect(page.getByText('94.00%').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Remove comparable sale from appraisal' })).toBeVisible();

  await page.goto('/appraisal/demo-appraisal/comparable_leases/appraisal');
  await expect(page.getByText('Feb 2025')).toBeVisible();
  await expect(page.getByText('Yrs. 1 - 5 @')).toBeVisible();
  await expect(page.getByText('$12.50').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Remove comparable lease from appraisal' })).toBeVisible();
});

test('comparable workflows stack maps and keep dense tables scrollable on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const workflow of [
    { route: 'comparable_sales/appraisal_caprate', mapTitle: 'Comparable sales map' },
    { route: 'comparable_leases/appraisal', mapTitle: 'Comparable leases map' },
  ]) {
    await page.goto(`/appraisal/demo-appraisal/${workflow.route}`);
    const listColumn = page.locator('.comparables-list-column');
    const mapColumn = page.locator('.comparables-map-column');
    expect(await listColumn.evaluate(element => element.scrollWidth > element.clientWidth)).toBeTruthy();
    const listBottom = await listColumn.evaluate(element => element.getBoundingClientRect().bottom);
    const mapTop = await mapColumn.evaluate(element => element.getBoundingClientRect().top);
    expect(mapTop).toBeGreaterThanOrEqual(listBottom - 1);
    await expect(page.getByTitle(workflow.mapTitle)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  }
});

test('new appraisal form requires a name before submission', async ({ page }) => {
  await page.goto('/appraisal/new');
  await page.getByText('Start a Short Appraisal').click();
  const name = page.getByLabel('Name');
  await expect(name).toHaveAttribute('required', '');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page).toHaveURL(/\/appraisal\/new$/);
  expect(await name.evaluate(element => element.matches(':invalid'))).toBeTruthy();
});

test('mobile dashboard has an accessible navigation toggle without page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/appraisals/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const toggle = page.locator('.sidebar-toggle');
  const sidebar = page.locator('#app-sidebar');
  await expect(toggle).toHaveAttribute('aria-label', 'Open navigation');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(sidebar).toHaveAttribute('inert', '');
  await expect(sidebar.locator('a', { hasText: 'Start an Appraisal' })).toHaveAttribute('tabindex', '-1');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-label', 'Close navigation');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('body')).toHaveClass(/aside-toggled/);
  const firstNavigationLink = page.getByRole('link', { name: 'Start an Appraisal' });
  await expect(firstNavigationLink).toBeVisible();
  await expect(firstNavigationLink).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('core workflows expose accessible structure, focus, labels, and controls', async ({ page }) => {
  await page.goto('/appraisal/demo-appraisal/expenses');
  await expect(page.locator('main#main-content')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1, name: /Expenses$/ })).toBeFocused();
  await expect(page).toHaveTitle(/Expenses.*Harbour Centre Demo.*Swiftly/);
  await expect(page.getByRole('button', { name: /Move Repairs and maintenance up/ })).toBeVisible();

  const unlabeledControls = await page.locator('input, select, textarea').evaluateAll(controls => controls.filter(control => {
    const style = getComputedStyle(control);
    const visible = style.display !== 'none' && style.visibility !== 'hidden' && control.getClientRects().length > 0;
    return visible && control.type !== 'hidden' && !control.getAttribute('aria-label') && !control.getAttribute('aria-labelledby') && !control.title && !control.labels?.length;
  }).length);
  expect(unlabeledControls).toBe(0);

  await page.goto('/appraisal/demo-appraisal/direct_comparison_valuation');
  await expect(page.locator('.comparable-sort-button').first()).toBeVisible();
  await expect(page.locator('.comparable-expand-button').first()).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('.comparable-sale-list-item h5')).toHaveCount(0);

  await page.goto('/appraisal/demo-appraisal/comparable_leases/database');
  await expect(page.locator('.comparable-sort-button').first()).toBeVisible();

  await page.goto('/appraisal/demo-appraisal/comparable_leases/appraisal');
  await expect(page.locator('.comparable-expand-button').first()).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('.comparable-lease-list-item h5')).toHaveCount(0);

  await page.locator('.navbar-brand').focus();
  const focusStyle = await page.locator('.navbar-brand').evaluate(element => getComputedStyle(element).outlineStyle);
  expect(focusStyle).not.toBe('none');
});

test('failed appraisal saves show recoverable feedback', async ({ page }) => {
  await page.goto('/appraisal/demo-appraisal/general');
  await page.route('**/appraisal/demo-appraisal', route => {
    if (route.request().method() === 'POST') return route.abort('failed');
    return route.continue();
  });

  const client = page.getByRole('textbox', { name: 'Client' });
  await client.fill('Demo Client save failure check');
  await client.press('Tab');
  const alert = page.getByRole('alert');
  await expect(alert).toContainText('Your changes could not be saved');
  await expect(alert.getByRole('button', { name: 'Try again' })).toBeVisible();
});

test('create and delete appraisal flow persists through the local API', async ({ page }) => {
  const name = `Browser appraisal ${Date.now()}`;
  await page.goto('/appraisal/new');
  await page.getByText('Start a Short Appraisal').click();
  await page.getByPlaceholder('Name').fill(name);
  await page.getByPlaceholder('Address').fill('99 Browser Test Way');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page).toHaveURL(/\/appraisal\/[\w-]+\/upload/);

  await page.goto('/appraisals/');
  const row = page.locator('tr', { hasText: name });
  await expect(row).toBeVisible();
  await expect(row).toContainText('99 Browser Test Way');
  page.once('dialog', dialog => dialog.accept());
  await row.getByRole('button', { name: `Delete ${name}` }).click();
  await expect(row).toHaveCount(0);
});

test('upload and remove a document through the browser', async ({ page }) => {
  await page.goto('/appraisal/demo-appraisal/upload');
  const upload = page.locator('input[type="file"]');
  const uploadName = `financial-statement-${Date.now()}.pdf`;
  const rows = page.locator('tr', { hasText: uploadName });
  const uploadResponse = page.waitForResponse(response => response.url().includes('/appraisal/demo-appraisal/files') && response.request().method() === 'POST' && response.ok());
  await upload.setInputFiles({
    name: uploadName,
    mimeType: 'application/pdf',
    buffer: fs.readFileSync(path.resolve(__dirname, '../../api/fixtures/financial-statement.pdf')),
  });
  await uploadResponse;
  await expect(rows).toHaveCount(1);
  const row = rows.first();
  await expect(row).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await row.getByRole('button', { name: 'Remove' }).click();
  await expect(rows).toHaveCount(0);
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
