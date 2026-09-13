import { test } from '../../fixtures/fixtures';
import { testStep } from '../../helpers/testStep';
import { registerUser } from '../../actions/auth/registerUser';
import { generateNewUser } from '../../helpers/testData/generateNewUser';

test.beforeEach(async ({ authApi, user }) => {
  await registerUser.viaApi(authApi, user);
});

test('TC-AUTH-010: Registration uniqueness on email, not full name', async ({
  authApi,
  user,
}) => {
  const cases = [
    {
      title: 'Same email, different name -> 409',
      user: { ...user, fullName: 'Someone Else' },
      expectedStatus: 409,
      expectedCode: 'EMAIL_ALREADY_REGISTERED',
    },
    {
      title: 'Same email, same name -> 409',
      user: { ...user },
      expectedStatus: 409,
      expectedCode: 'EMAIL_ALREADY_REGISTERED',
    },
    {
      title: 'Different email, same name -> 201',
      user: { ...user, email: generateNewUser().email },
      expectedStatus: 201,
      expectedCode: undefined,
    },
  ];

  for (const testCase of cases) {
    await testStep(testCase.title, async () => {
      await authApi.assertRegistrationOutcome(
        testCase.user,
        testCase.expectedStatus,
        testCase.expectedCode,
      );
    });
  }
});
