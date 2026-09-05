import { expect, testStep } from './testStep';

export function decodeJwtHeader(token) {
  const [headerBase64] = token.split('.');

  return JSON.parse(Buffer.from(headerBase64, 'base64url').toString('utf-8'));
}

export async function assertJwtHeaderAlgorithm(token, algorithm) {
  await testStep(`Assert JWT header algorithm is "${algorithm}"`, async () => {
    const header = decodeJwtHeader(token);

    expect(header.alg).toBe(algorithm);
  });
}
