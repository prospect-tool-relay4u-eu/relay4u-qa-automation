import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { existingUser } from '../helpers/testData/existingUser';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(existingUser.email, existingUser.password);

    await use(page);
  },

  projectsPage: async ({ authenticatedPage }, use) => {
    const projectsPage = new ProjectsPage(authenticatedPage);

    await projectsPage.assertLoaded();

    await use(authenticatedPage);
  },
});

export { expect };
