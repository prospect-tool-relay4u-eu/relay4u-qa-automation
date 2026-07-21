import { expect } from '../../helpers/testStep';
import { BasePage } from '../BasePage';
import { AUTH_MESSAGES } from '../../helpers/constants/authMessages';

export class LoginPage extends BasePage {
  constructor(page, actorLabel = null) {
    super(page, actorLabel);
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.logInButton = page.getByRole('button', { name: 'Log in' });
    this.pageAnchor = page.getByRole('heading', { name: 'Log in' });
    this.invalidCredentialsError = page.getByText(
      AUTH_MESSAGES.INVALID_CREDENTIALS,
      { exact: true },
    );
    this.verifiedMessage = page.getByText(AUTH_MESSAGES.ACCOUNT_VERIFIED, {
      exact: true,
    });
  }

  async login(email, password) {
    await this.step(`Fill "Email" with "${email}"`, async () => {
      await this.emailInput.fill(email);
    });

    await this.step(`Fill "Password" with ${password}`, async () => {
      await this.passwordInput.fill(password);
    });

    await this.step(`Click "Log in"`, async () => {
      await this.logInButton.click();
    });
  }

  async assertLoaded() {
    await this.step(`Assert login page is loaded`, async () => {
      await expect(this.pageAnchor).toBeVisible();
    });
  }

  async assertInvalidCredentialsError() {
    await this.step(
      `Assert "${AUTH_MESSAGES.INVALID_CREDENTIALS}" is shown`,
      async () => {
        await expect(this.invalidCredentialsError).toBeVisible();
      },
    );
  }

  async assertVerifiedMessage() {
    await this.step(
      `Assert "${AUTH_MESSAGES.ACCOUNT_VERIFIED}" is shown`,
      async () => {
        await expect(this.verifiedMessage).toBeVisible();
      },
    );
  }
}
