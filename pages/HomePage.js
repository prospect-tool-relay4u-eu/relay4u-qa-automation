import { expect } from '../helpers/testStep';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  constructor(page, actorLabel = null) {
    super(page, actorLabel);
    this.signUpLink = page.getByRole('link', { name: 'Sign up for free' });
    this.logInLink = page.getByRole('link', {
      name: 'I already have an account',
    });
    this.pageAnchor = page.getByRole('heading', {
      name: 'Your data, your columns',
    });
  }

  async goto() {
    await this.step(`Open the home page`, async () => {
      await this.page.goto('/');
    });
  }

  async clickSignUp() {
    await this.step(`Click "Sign up for free"`, async () => {
      await this.signUpLink.click();
    });
  }

  async clickLogIn() {
    await this.step(`Click "I already have an account"`, async () => {
      await this.logInLink.click();
    });
  }

  async assertLoaded() {
    await this.step(`Assert home page is loaded`, async () => {
      await expect(this.pageAnchor).toBeVisible();
    });
  }
}
