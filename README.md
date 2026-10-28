# Contact List – Playwright Web + API Framework

Playwright + TypeScript framework for the [Thinking Tester Contact List app](https://thinking-tester-contact-list.herokuapp.com/),
built in the same style as the OpenCart framework: Page Object Model, fixtures, data-driven tests (CSV / Excel / JSON),
an `ApiHelper`, AJV schema tests, dotenv environments, Allure + reportingLabs reports, Docker and GitHub Actions.

## Setup
```bash
npm ci
npx playwright install chromium
```
The app is public, so no secrets are needed. `config/.env.<ENV>` only holds the URLs.

## Run
| Command | What it runs |
|---|---|
| `npm test` | everything (`ENV=qa` by default) |
| `npm run test:ui` / `test:api` / `test:e2e` / `test:network` | one folder |
| `npm run test:smoke` / `test:regression` | by tag |
| `ENV=dev npx playwright test` | another env file |
| `npm run allure:report` | build and open the Allure report |

## Structure
```
src/
  api/ApiHelper.ts          get / post / put / patch / delete
  fixtures/                 pagefixtures.ts, apifixtures.ts
  pages/                    BasePage, LoginPage, SignUpPage, ContactListPage,
                            AddContactPage, ContactDetailsPage, EditContactPage
  schema/                   JSON schemas for AJV
  testdata/                 CSV, JSON and Excel data
  utils/                    CsvHelper, ExcelHelper, JsonHelper, emailUtil
tests/
  ui/       login, signup, add / edit / delete contact
  api/      user, contact CRUD, negative, schema
  e2e/      full UI flow
  network/  intercept and mock
```

## Notes
- The app has no fixed user (its database is purged), so UI tests sign up a new user with `uniqueEmail()`;
  the app logs the new user in and lands on the contact list.
- API specs are `describe.serial`: the first test signs up and keeps the token for the next ones (like the GoRest tests).
- Delete asks for a browser `confirm()`; `ContactDetailsPage.deleteContact()` accepts it.
- Docker: `docker build -t contactlist-tests . && docker run --rm contactlist-tests`;
  4 local shards: `docker compose -f docker-compose.shard.yml up --build`.
- Keep the Docker image tag in step with the `@playwright/test` version.
