import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';
import { ProjectsPage } from '../pages/ProjectsPage';

export const test = base.extend({
  loggedInPage: async ({ browser }, use) => {
    const page = await browser.newPage();
    const loginPage = new LoginPage(page);
    const projectsPage = new ProjectsPage(page);

    await loginPage.goto();

    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;

    await loginPage.login(email, password);

    await projectsPage.assertLoaded();

    await use(page);

    await page.close();
  },
});

export { expect };
