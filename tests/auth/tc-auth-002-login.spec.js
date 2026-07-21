import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/auth/LoginPage';
import { existingUser } from '../../helpers/testData/existingUser';

test('TC-AUTH-002: Login with valid credentials returns JWT', async ({
  page,
}) => {
  const homePage = new HomePage(page);
  const loginPage = new LoginPage(page);

  await homePage.goto();
  await homePage.clickLogIn();

  await loginPage.assertLoaded();

  await loginPage.login(existingUser.email, existingUser.password);

  await expect(page).toHaveURL(/\/projects/);

  const token = await page.evaluate(() => {
    return sessionStorage.getItem('r4u-token');
  });
  expect(token).toBeTruthy();

  const [headerPart] = token.split('.');
  const header = JSON.parse(Buffer.from(headerPart, 'base64url').toString());
  expect(header.alg).toBe('RS256');
});
