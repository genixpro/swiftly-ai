import {expect, test, type Page} from '@playwright/test';
import {appraisalRoutes, visualViewports} from './parity-contract';

async function settleVisualState(page: Page) {
    await expect(page.locator('#app')).not.toBeEmpty();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Loading appraisal…')).toHaveCount(0, {timeout: 15_000});
    await expect(page.getByText('Saving changes…')).toHaveCount(0, {timeout: 15_000});
    await page.addStyleTag({content: `
        *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            caret-color: transparent !important;
        }
    `});
    await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(Array.from(document.images, image => {
            if (image.complete) return Promise.resolve();
            return new Promise<void>(resolve => {
                image.addEventListener('load', () => resolve(), {once: true});
                image.addEventListener('error', () => resolve(), {once: true});
            });
        }));
    });
}

test.describe('visual parity contract', () => {
    test.skip(({browserName}) => browserName !== 'chromium', 'Visual baselines use pinned Chromium rendering.');

    for (const [viewportName, viewport] of Object.entries(visualViewports)) {
        for (const route of appraisalRoutes) {
            test(`${viewportName}: ${route}`, async ({page}) => {
                await page.setViewportSize(viewport);
                const response = await page.goto(route);
                expect(response?.ok()).toBeTruthy();
                await settleVisualState(page);
                const snapshotName = `${viewportName}-${route.replaceAll('/', '-').replace(/^-/, '')}.png`;
                await expect(page).toHaveScreenshot(snapshotName, {fullPage: true});
            });
        }
    }

    test('mobile navigation open state', async ({page}) => {
        await page.setViewportSize(visualViewports.mobile);
        await page.goto('/appraisals/');
        await settleVisualState(page);
        await page.locator('.sidebar-toggle').click();
        await settleVisualState(page);
        await expect(page).toHaveScreenshot('mobile-navigation-open.png', {fullPage: true});
    });

    test('comparable sale expanded state', async ({page}) => {
        await page.setViewportSize(visualViewports.desktop);
        await page.goto('/appraisal/demo-appraisal/comparable_sales/appraisal_caprate');
        await settleVisualState(page);
        await page.locator('.comparable-expand-button').first().click();
        await settleVisualState(page);
        await expect(page).toHaveScreenshot('comparable-sale-expanded.png', {fullPage: true});
    });

    test('calculation popover state', async ({page}) => {
        await page.setViewportSize(visualViewports.desktop);
        await page.goto('/appraisal/demo-appraisal/stabilized_statement_valuation');
        await settleVisualState(page);
        const structuralAllowance = page.getByRole('button', {name: /Structural Allowance @/});
        test.skip(await structuralAllowance.count() === 0, 'The seeded appraisal has no structural allowance calculation to expand.');
        await structuralAllowance.click();
        await expect(page.getByRole('tooltip')).toBeVisible();
        await settleVisualState(page);
        await expect(page).toHaveScreenshot('structural-allowance-popover.png', {fullPage: true});
    });
});
