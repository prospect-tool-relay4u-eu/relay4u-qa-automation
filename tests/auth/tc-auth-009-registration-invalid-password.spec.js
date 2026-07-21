import { test } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { SignUpPage } from '../../pages/auth/SignUpPage';
import { generateNewUser } from '../../helpers/testData/generateNewUser';
import { AUTH_MESSAGES } from '../../helpers/constants/authMessages';

test('TC-AUTH-009: Invalid password shows generic error', async ({ page }) => {
  test.fail(
    true,
    'Known bug: frontend shows a generic "An error occurred" message ' +
      'instead of the real backend validation reason.',
  );

  const user = generateNewUser();
  const passwordMissingSpecialChar = 'NoSpecialChar123';
  const homePage = new HomePage(page, user.fullName);
  const signUpPage = new SignUpPage(page, user.fullName);

  await homePage.goto();
  await homePage.clickSignUp();

  await signUpPage.assertLoaded();

  await signUpPage.signUp(
    user.fullName,
    user.email,
    passwordMissingSpecialChar,
  );

  await signUpPage.assertErrorMessage(AUTH_MESSAGES.PASSWORD_REQUIREMENTS);
});
