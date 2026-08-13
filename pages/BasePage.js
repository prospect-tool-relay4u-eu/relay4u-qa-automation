import { testStep } from '../helpers/testStep';

export class BasePage {
  constructor(page, actorLabel = null) {
    this.page = page;
    this.actorLabel = actorLabel;
  }

  async step(title, stepToRun) {
    return await testStep(title, stepToRun, this.actorLabel);
  }

  async openAndAssert() {
    throw new Error(
      `openAndAssert() is not implemented for ${this.constructor.name}`,
    );
  }
}
