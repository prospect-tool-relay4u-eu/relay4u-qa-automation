import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/auth/LoginPage';
import { AuthAPI } from '../api/auth/AuthAPI';

export const test = base.extend({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);

    await use(loginPage);
  },

  authApi: async ({ request }, use) => {
    const authApi = new AuthAPI(request);

    await use(authApi);
  },
});

export { expect } from '@playwright/test';
