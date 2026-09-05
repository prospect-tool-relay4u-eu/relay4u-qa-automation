import { test } from '../../fixtures/fixtures';
import { assertJwtHeaderAlgorithm } from '../../helpers/decodeJwt';

test('TC-AUTH-002: Login with valid credentials returns JWT (RS256)', async ({
  authApi,
  user,
}) => {
  const creationResponse = await authApi.createNewUser(user);

  await authApi.assertSuccessfulCreation(creationResponse);

  const token = await authApi.loginUser(user);

  await assertJwtHeaderAlgorithm(token, 'RS256');
});
