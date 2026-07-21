import { expect } from '../../helpers/testStep';
import { BasePage } from '../BasePage';

export class VerifyEmailPage extends BasePage {
  constructor(page, actorLabel = null) {
    super(page, actorLabel);
    this.codeInput = page.getByRole('textbox', { name: 'Verification code' });
    this.verifyButton = page.getByRole('button', { name: 'Verify account' });
    this.pageAnchor = page.getByRole('heading', { name: 'Email verification' });
  }

  async verifyEmail(code) {
    await this.step(`Fill "Verification code" with "${code}"`, async () => {
      await this.codeInput.fill(code);
    });

    await this.step(`Click "Verify account"`, async () => {
      await this.verifyButton.click();
    });
  }

  async assertLoaded() {
    await this.step(`Assert verify email page is loaded`, async () => {
      await expect(this.pageAnchor).toBeVisible();
    });
  }
}
