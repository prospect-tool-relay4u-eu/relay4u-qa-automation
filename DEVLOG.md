# Dev Log

Running log of what changed between commits, in more detail than a commit
message allows. Commits stay short; PR descriptions and this file carry the
full story — what was built, why, and how to use it. Each entry below is
written to be copy-pasted straight into the matching PR description.

---

## 2026-07-21 18:12 — TC-AUTH-001 runs end-to-end, plus the framework pieces it needed

`tests/auth/tc-auth-001-registration.spec.js` now covers the full
scenario: register → real email arrives → enter the code → land on
`/login?verified=true` → log in → land on `/projects` with the right
user's name shown. Previously it stopped at the "check your email" screen.

**Run it:** `npx playwright test tests/auth/tc-auth-001-registration.spec.js`
— every run sends one real email via testmail.app (100/month, shared team
quota). Don't loop it while debugging something unrelated.

**New:**

- `helpers/email/getVerificationCode.js` — `createTestEmail()` +
  `getVerificationCode(tag)`, fetches the real 6-digit code from
  testmail.app. New env vars: `TESTMAIL_API_KEY`, `TESTMAIL_API_URL`,
  `TESTMAIL_NAMESPACE` (in `.env`/`.env.example`).
- `helpers/testStep.js` + `pages/BasePage.js` — every Page Object now
  extends `BasePage` and gets `this.step()` for free (wraps Playwright's
  `test.step()`). Optional `actorLabel` prefixes steps per-user, for
  future multi-user IDOR tests.
- `pages/auth/SignUpPage.js`, `LoginPage.js`, `VerifyEmailPage.js` — moved
  under `pages/auth/`, separate from general pages.
- `pages/ProjectsPage.js` — new. Checks the `/projects` heading
  (`exact: true` — otherwise also matches the "No projects yet" empty
  state) and the logged-in user's name.
- `helpers/constants/authMessages.js` — exact UI/API strings
  (`AUTH_MESSAGES`), one source of truth instead of hardcoded strings in
  every Page Object. Split by domain — Mateusz adds his own file for
  fields/projects/records instead of us sharing one file.
- `helpers/testData/generateNewUser.js` — password suffix `A1!` → `Aa1!`,
  fixes an intermittent backend validation failure (missing complexity
  class).
- See `REFERENCE.md` for how to use any of the above.
