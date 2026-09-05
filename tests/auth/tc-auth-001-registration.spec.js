import { test } from '../../fixtures/fixtures';
import { HomePage } from '../../pages/HomePage';
import { SignUpPage } from '../../pages/auth/SignUpPage';
import { VerifyEmailPage } from '../../pages/auth/VerifyEmailPage';
import { LoginPage } from '../../pages/auth/LoginPage';
import { ProjectsPage } from '../../pages/projects/ProjectsPage';

test('TC-AUTH-001', async ({ page, user }) => {
  const homePage = new HomePage(page, user.fullName);
  const signUpPage = new SignUpPage(page, user.fullName);
  const verifyEmailPage = new VerifyEmailPage(page, user.fullName);
  const loginPage = new LoginPage(page, user.fullName);
  const projectsPage = new ProjectsPage(page, user.fullName);

  await homePage.openAndAssert();
  await homePage.clickSignUp();

  await signUpPage.assertLoaded();

  await signUpPage.signUp(user.fullName, user.email, user.password);

  await verifyEmailPage.assertLoaded();

  const code = await verifyEmailPage.getVerificationCode();

  await verifyEmailPage.verifyEmail(code);

  await loginPage.assertLoaded();
  await loginPage.assertVerifiedMessage();

  await loginPage.login(user.email, user.password);

  await projectsPage.assertLoaded();
  await projectsPage.assertUserNameDisplayed(user.fullName);
});
