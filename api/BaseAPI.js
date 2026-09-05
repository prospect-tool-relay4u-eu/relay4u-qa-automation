import { testStep } from '../helpers/testStep';

export class BaseAPI {
  constructor(request, actorLabel = null) {
    this.request = request;
    this.actorLabel = actorLabel;
  }

  async step(title, stepToRun) {
    return await testStep(title, stepToRun, this.actorLabel);
  }

  parseStatus(response) {
    return response.status();
  }

  async parseBody(response) {
    return await response.json();
  }
}
