import { expect } from '../helpers/testStep';
import { BasePage } from './BasePage';

export class ProjectDetailsPage extends BasePage {
  static urlPattern = /\/projects\/(\d+)$/;

  constructor(page, actorLabel = null) {
    super(page, actorLabel);
    this.pageAnchor = page.getByRole('button', { name: 'Manage fields' });
  }

  async waitForPage() {
    return this.step('Wait for Project Details page to load', async () => {
      await expect(this.page).toHaveURL(ProjectDetailsPage.urlPattern);
    });
  }

  async waitForProject(projectId) {
    return this.step(
      `Wait for Project Details page for project ${projectId}`,
      async () => {
        const exact = new RegExp(`/projects/${projectId}$`);
        await expect(this.page).toHaveURL(exact);
      },
    );
  }

  async clickAddRecord() {
    return this.step('Click "Add record" button', async () => {
      await this.page.getByRole('button', { name: '+ Add record' }).click();
    });
  }

  async assertRecordFieldAdded(rowIndex) {
    return this.step(
      `Assert record with row number "${rowIndex}" is added`,
      async () => {
        const row = this.page.locator('tbody tr').filter({
          has: this.page.locator('td.td-num', {
            hasText: new RegExp(`^${rowIndex}$`),
          }),
        });

        await expect(row).toBeVisible();
      },
    );
  }

  async fillRecordField(columnIndex, rowIndex, value) {
    return this.step(
      `Fill record in column ${columnIndex}, row "${rowIndex}"
       with "${value}"`,
      async () => {
        const row = this.page.locator('tbody tr').filter({
          has: this.page.locator('td.td-num', {
            hasText: new RegExp(`^${rowIndex}$`),
          }),
        });

        const cell = row.locator('td').nth(columnIndex);
        await cell.click();
        await cell.getByRole('textbox').fill(value);
      },
    );
  }

  async assertRecordFieldProperValue(columnIndex, rowIndex, expectedValue) {
    return this.step(
      `Expect column ${columnIndex}, row "${rowIndex}"
       to have "${expectedValue}"`,
      async () => {
        const row = this.page.locator('tbody tr').filter({
          has: this.page.locator('td.td-num', {
            hasText: new RegExp(`^${rowIndex}$`),
          }),
        });

        const cell = row.locator('td').nth(columnIndex);
        await expect(cell).toHaveText(expectedValue);
      },
    );
  }

  async clickProjectsNavLink() {
    return this.step('Click "Projects" nav link', async () => {
      await this.page
        .getByRole('navigation')
        .getByRole('link', { name: 'Projects', exact: true })
        .click();
    });
  }

  async clickLogOut() {
    return this.step('Log out', async () => {
      await this.page.getByRole('button', { name: 'Log out' }).click();
    });
  }
}
