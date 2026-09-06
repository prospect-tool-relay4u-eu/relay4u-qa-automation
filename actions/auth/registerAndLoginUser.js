import { testStep } from '../../helpers/testStep';
import { AuthAPI } from '../../api/auth/AuthAPI';
import { LoginPage } from '../../pages/auth/LoginPage';
import { SignUpPage } from '../../pages/auth/SignUpPage';
import { VerifyEmailPage } from '../../pages/auth/VerifyEmailPage';
import { ProjectsPage } from '../../pages/projects/ProjectsPage';

export const registerAndLoginUser = {
  async viaApi(page, request, user, actorLabel = null) {
    await testStep(
      `Register and log in new user via API "${user.email}"`,
      async () => {
        const authApi = new AuthAPI(request, actorLabel);
        const loginPage = new LoginPage(page, actorLabel);
        const projectsPage = new ProjectsPage(page, actorLabel);

        const creationResponse = await authApi.createNewUser(user);

        await authApi.assertSuccessfulCreation(creationResponse);

        await loginPage.openAndAssert();
        await loginPage.login(user.email, user.password);

        await projectsPage.assertLoaded();
      },
      actorLabel,
    );
  },

  async viaUi(page, user, actorLabel = null) {
    await testStep(
      `Register and log in new user via UI "${user.email}"`,
      async () => {
        const signUpPage = new SignUpPage(page, actorLabel);
        const verifyEmailPage = new VerifyEmailPage(page, actorLabel);
        const loginPage = new LoginPage(page, actorLabel);
        const projectsPage = new ProjectsPage(page, actorLabel);

        await signUpPage.openAndAssert();
        await signUpPage.signUp(user.fullName, user.email, user.password);

        await verifyEmailPage.assertLoaded();

        const code = await verifyEmailPage.getVerificationCode();

        await verifyEmailPage.verifyEmail(code);

        await loginPage.assertLoaded();
        await loginPage.assertVerifiedMessage();

        await loginPage.login(user.email, user.password);

        await projectsPage.assertLoaded();
      },
      actorLabel,
    );
  },
};
