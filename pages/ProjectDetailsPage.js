import { expect } from '../helpers/testStep';
import { BasePage } from './BasePage';

export class ProjectDetailsPage extends BasePage {
  static urlPattern = /\/projects\/(\d+)$/;
  constructor(page) {
    super(page);
    this.pageAnchor = this.page.getByRole('button', { name: 'Add record' });
    this.tableRows = page.locator('tbody tr');
    this.projectsNavLink = this.page
      .getByRole('navigation')
      .getByRole('link', { name: 'Projects', exact: true });
    this.columnHeaders = this.page.getByRole('columnheader');
  }

  getRow(rowIndex) {
    return this.tableRows.filter({
      has: this.page.locator('td.td-num', {
        hasText: new RegExp(`^${rowIndex}$`),
      }),
    });
  }

  getCell(rowIndex, columnIndex) {
    return this.getRow(rowIndex).locator('td').nth(columnIndex);
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

  async assertLoaded() {
    return this.step('Assert Project Details page is loaded', async () => {
      await expect(this.pageAnchor).toBeVisible();
    });
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
        await expect(this.getRow(rowIndex)).toBeVisible();
      },
    );
  }

  async clickRecordField(rowIndex, columnIndex) {
    return this.step(
      `Click record field in column ${columnIndex}, row "${rowIndex}"`,
      async () => {
        const cell = this.getCell(rowIndex, columnIndex);
        await cell.click();
        await this.page.keyboard.press('Tab');
      },
    );
  }

  async fillRecordField(rowIndex, columnIndex, value) {
    return this.step(
      `Fill record field in column ${columnIndex}, row "${rowIndex}" ` +
        `with "${value}"`,
      async () => {
        const cell = this.getCell(rowIndex, columnIndex);
        await cell.click();
        await cell.getByRole('textbox').fill(value);
        await this.page.keyboard.press('Tab');
      },
    );
  }

  async assertRecordFieldProperValue(rowIndex, columnIndex, expectedValue) {
    return this.step(
      `Expect column ${columnIndex}, row "${rowIndex}" ` +
        `to have "${expectedValue}"`,
      async () => {
        await expect(this.getCell(rowIndex, columnIndex)).toHaveText(
          expectedValue,
        );
      },
    );
  }

  async clickRecordDeleteButton(rowIndex) {
    return this.step(
      `Click "Delete record" button for row "${rowIndex}"`,
      async () => {
        const deleteButton = this.getRow(rowIndex).getByLabel('Delete record');
        await deleteButton.click();
      },
    );
  }

  async assertRecordDeleted(rowIndex) {
    return this.step(
      `Assert record with row number "${rowIndex}" is deleted`,
      async () => {
        await expect(this.getRow(rowIndex)).toHaveCount(0);
      },
    );
  }

  async assertColumnsOrder(...columnNames) {
    return this.step(
      `Verify that columns have proper names and order`,
      async () => {
        for (const [index, name] of columnNames.entries()) {
          const header = this.columnHeaders.nth(index);
          await expect(
            header,
            `Column #${index} should be visible`,
          ).toBeVisible();
          await expect(
            header,
            `Column #${index} should have name "${name}"`,
          ).toContainText(name);
        }
      },
    );
  }

  async clickProjectsNavLink() {
    return this.step('Click "Projects" nav link', async () => {
      await this.projectsNavLink.click();
    });
  }
}
