import { testStep } from '../../helpers/testStep';
import { SignUpPage } from '../../pages/auth/SignUpPage';
import { VerifyEmailPage } from '../../pages/auth/VerifyEmailPage';

export const registerUser = {
  async viaApi(authApi, user, actorLabel = null) {
    return await testStep(
      `Register user via API "${user.email}"`,
      async () => {
        const creationResponse = await authApi.createNewUser(user);

        await authApi.assertSuccessfulCreation(creationResponse);

        return creationResponse;
      },
      actorLabel,
    );
  },

  async viaUi(page, user, actorLabel = null) {
    await testStep(
      `Register user via UI "${user.email}"`,
      async () => {
        const signUpPage = new SignUpPage(page, actorLabel);
        const verifyEmailPage = new VerifyEmailPage(page, actorLabel);

        await signUpPage.openAndAssert();
        await signUpPage.signUp(user.fullName, user.email, user.password);

        await verifyEmailPage.assertLoaded();

        const code = await verifyEmailPage.getVerificationCode();

        await verifyEmailPage.verifyEmail(code);
      },
      actorLabel,
    );
  },
};
