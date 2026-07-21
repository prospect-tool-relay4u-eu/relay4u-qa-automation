import { randomUUID } from 'node:crypto';

const TESTMAIL_API_URL = process.env.TESTMAIL_API_URL;

export function createTestEmail() {
  const namespace = process.env.TESTMAIL_NAMESPACE;
  const tag = randomUUID();
  const email = `${namespace}.${tag}@inbox.testmail.app`;

  return { email, tag };
}

export async function getVerificationCode(tag) {
  const url = new URL(TESTMAIL_API_URL);

  url.searchParams.set('apikey', process.env.TESTMAIL_API_KEY);
  url.searchParams.set('namespace', process.env.TESTMAIL_NAMESPACE);
  url.searchParams.set('tag', tag);
  url.searchParams.set('livequery', 'true');

  const response = await fetch(url);
  const data = await response.json();

  if (data.result !== 'success' || data.count === 0) {
    throw new Error(`No verification email received for tag "${tag}"`);
  }

  const latestEmail = data.emails[0];
  const match = latestEmail.text.match(/\d{6}/);

  if (!match) {
    throw new Error(
      `Verification code not found in email body for tag "${tag}"`,
    );
  }

  return match[0];
}
