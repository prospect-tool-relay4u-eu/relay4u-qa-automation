import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  loggedInPage: async ({ browser }, use) => {
    const page = await browser.newPage();

    await page.goto('/login');

    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;

    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page).toHaveURL(/\/projects/);

    await use(page);

    await page.close();
  },
});

export { expect };
