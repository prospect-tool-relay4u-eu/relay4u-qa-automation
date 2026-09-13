import { testStep } from '../../helpers/testStep';
import { AuthAPI } from '../../api/auth/AuthAPI';
import { LoginPage } from '../../pages/auth/LoginPage';
import { ProjectsPage } from '../../pages/projects/ProjectsPage';
import { registerUser } from './registerUser';

export const registerAndLoginUser = {
  async viaApi(page, request, user, actorLabel = null) {
    await testStep(
      `Register and log in new user via API "${user.email}"`,
      async () => {
        const authApi = new AuthAPI(request, actorLabel);
        const loginPage = new LoginPage(page, actorLabel);
        const projectsPage = new ProjectsPage(page, actorLabel);

        await registerUser.viaApi(authApi, user, actorLabel);

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
        const loginPage = new LoginPage(page, actorLabel);
        const projectsPage = new ProjectsPage(page, actorLabel);

        await registerUser.viaUi(page, user, actorLabel);

        await loginPage.assertLoaded();
        await loginPage.assertVerifiedMessage();

        await loginPage.login(user.email, user.password);

        await projectsPage.assertLoaded();
      },
      actorLabel,
    );
  },
};
