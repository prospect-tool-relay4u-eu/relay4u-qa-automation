import { expect } from '../helpers/testStep';
import { BasePage } from './BasePage';

export class ProjectsPage extends BasePage {
  constructor(page, actorLabel = null) {
    super(page, actorLabel);
    this.pageAnchor = page.getByRole('heading', {
      name: 'Projects',
      exact: true,
    });
    this.userNameDisplay = page.locator('.user-email');
  }

  async assertLoaded() {
    await this.step(`Assert projects page is loaded`, async () => {
      await expect(this.pageAnchor).toBeVisible();
    });
  }

  async assertUserNameDisplayed(fullName) {
    await this.step(
      `Assert logged-in user name "${fullName}" is shown`,
      async () => {
        await expect(this.userNameDisplay).toHaveText(fullName);
      },
    );
  }
}
