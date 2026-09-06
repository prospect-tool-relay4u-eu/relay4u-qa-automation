import { expect } from '../../helpers/testStep';
import { BaseAPI } from '../BaseAPI';

export class AuthAPI extends BaseAPI {
  #baseUrl;

  constructor(request, actorLabel = null) {
    super(request, actorLabel);
    this.#baseUrl =
      'https://relay4u-auth-be-staging-942989865043.europe-west1.run.app';
  }

  async #register(user) {
    return await this.step(`Register user "${user.email}"`, async () => {
      return await this.request.post(`${this.#baseUrl}/api/auth/register`, {
        data: {
          name: user.fullName,
          email: user.email,
          password: user.password,
          confirmPassword: user.password,
        },
      });
    });
  }

  async #verifyEmail(email, code) {
    return await this.step(
      `Verify email "${email}" with code "${code}"`,
      async () => {
        return await this.request.post(
          `${this.#baseUrl}/api/auth/verify-email`,
          { data: { email, code } },
        );
      },
    );
  }

  async #login(email, password) {
    return await this.step(`Log in as "${email}"`, async () => {
      return await this.request.post(`${this.#baseUrl}/api/auth/login`, {
        data: { email, password },
      });
    });
  }

  async createNewUser(user) {
    return await this.step(`Create new user "${user.email}"`, async () => {
      const registerResponse = await this.#register(user);

      expect(this.parseStatus(registerResponse)).toBe(201);

      const { verificationCode } = await this.parseBody(registerResponse);

      return await this.#verifyEmail(user.email, verificationCode);
    });
  }

  async assertSuccessfulCreation(response) {
    await this.step('Assert new user was created successfully', async () => {
      expect(this.parseStatus(response)).toBe(200);
    });
  }

  async loginUser(user) {
    return await this.step(`Log in new user "${user.email}"`, async () => {
      const loginResponse = await this.#login(user.email, user.password);

      expect(this.parseStatus(loginResponse)).toBe(200);

      const { token } = await this.parseBody(loginResponse);

      return token;
    });
  }
}
