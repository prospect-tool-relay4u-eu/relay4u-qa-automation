import { expect } from '../../helpers/testStep';
import { BasePage } from '../BasePage';

export class SignUpPage extends BasePage {
  constructor(page, actorLabel = null) {
    super(page, actorLabel);
    this.fullNameInput = page.getByRole('textbox', { name: 'Full name' });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.passwordInput = page.getByRole('textbox', {
      name: 'Password',
      exact: true,
    });
    this.confirmPasswordInput = page.getByRole('textbox', {
      name: 'Confirm password',
    });
    this.signUpButton = page.getByRole('button', { name: 'Sign up' });
    this.pageAnchor = page.getByRole('link', { name: 'Relay4U Relay4U' });
    this.errorMessage = page.locator('.alert-error');
  }

  async signUp(fullName, email, password) {
    await this.step(`Fill "Full name" with "${fullName}"`, async () => {
      await this.fullNameInput.fill(fullName);
    });

    await this.step(`Fill "Email" with "${email}"`, async () => {
      await this.emailInput.fill(email);
    });

    await this.step(`Fill "Password" with ${password}`, async () => {
      await this.passwordInput.fill(password);
    });

    await this.step(`Fill "Confirm password" with ${password}`, async () => {
      await this.confirmPasswordInput.fill(password);
    });

    await this.step(`Click "Sign up"`, async () => {
      await this.signUpButton.click();
    });
  }

  async assertLoaded() {
    await this.step(`Assert sign up page is loaded`, async () => {
      await expect(this.pageAnchor).toBeVisible();
    });
  }

  async assertErrorMessage(message) {
    await this.step(`Assert error message "${message}" is shown`, async () => {
      await expect(this.errorMessage).toContainText(message);
    });
  }
}
