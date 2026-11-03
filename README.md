# Contact List Framework (Playwright + TypeScript)

An end-to-end test automation framework for the [Thinking Tester Contact List app](https://thinking-tester-contact-list.herokuapp.com), covering both the **REST API** and the **web UI** in a single Playwright project. It runs in parallel, shards across multiple workers, and is wired into a Jenkins pipeline and GitHub Actions, with Docker for the sharded runs.

I built this to learn how a real-world QA framework fits together, from the first test to a CI/CD pipeline that runs it, so it covers the whole path rather than just the test code.



---

## What's in here

**56 automated tests** across API and UI, all passing on the latest QA run (14.8 seconds, 4 workers).

| Layer | Tests | What it covers |
|---|---|---|
| API – CRUD | 8 | Add, get, update (PUT and PATCH), delete a contact, and confirm the deleted one returns 404 |
| API – User flow | 5 | Sign up → login → profile → update → logout |
| API – Negative | 10 | Missing token, invalid token, bad JSON, short password, duplicate email, wrong password, nonexistent contact |
| API – Schema | 4 | Response shape checks for sign up, profile, contact list and add contact |
| UI – Login / Sign up | 14 | Page rendering, valid and invalid credentials, field validation, cancel flows |
| UI – Contacts | 11 | Add (all fields, mandatory only, cancel), edit, delete, details page |
| UI – Network interception | 3 | Logging real requests, mocking the contacts API with fake JSON, mocking a 401 login |
| E2E | 1 | Sign up, add, edit, delete a contact and log out in one flow |

A few things I wanted the framework to do properly:

- **Data-driven tests**: login, sign up and add-contact tests read from CSV files, so adding a new case means adding a row, not a new test.
- **API + UI together**: API calls handle setup (sign up, get a token) so UI tests don't waste time clicking through screens they aren't testing.
- **Tagging**: every test carries `@smoke`, `@regression` or `@e2e`, so I can run a quick sanity pass or the full suite from the same codebase.
- **Network mocking**: the app is tested against failure responses I can't easily trigger on the real server.

---

## Tech stack

- **Playwright** (`@playwright/test`) with **TypeScript**
- **Node.js** 24
- **Docker** and `docker-compose` for sharded runs
- **Jenkins** (declarative `Jenkinsfile`) for the multi-environment pipeline
- **GitHub Actions** for CI (started manually for now)
- **reportingLabs** for the merged HTML/PDF report with analytics

---

## Project structure

```
contact_list_framework/
├── .github/                   # GitHub Actions workflow(s)
├── config/                    # Configuration (base URL, environment settings)
├── src/                       # Page objects, API clients, utilities, test data helpers
├── tests/                     # Spec files (API + UI)
├── reports/                   # Generated reports
├── Dockerfile                 # Test runner image
├── docker-compose.shard.yml   # Runs the suite as parallel shards
├── Jenkinsfile                # Multi-environment pipeline
├── playwright.config.ts       # Playwright settings
├── reporting-labs.config.ts   # Report configuration
└── package.json
```

---

## Getting started

### Prerequisites

- Node.js 20 or later (I run 24)
- Git
- Docker (only needed for sharded runs)

### Install

```bash
git clone https://github.com/reshmimahadevan/ContactListFramework_Playwright.git
cd ContactListFramework_Playwright
npm ci
npx playwright install --with-deps chromium
```

### Run the tests

```bash
# everything
npx playwright test

# only the quick sanity checks
npx playwright test --grep @smoke

# the full regression pack
npx playwright test --grep @regression

# just the API tests, or just one file
npx playwright test tests/api
npx playwright test login.spec.ts

# watch the browser, or step through with the inspector
npx playwright test --headed
npx playwright test --debug
```

### Run shards locally with Docker

```bash
docker compose -f docker-compose.shard.yml up --build
```

Each shard writes its own report folder. To stitch them into one report:

```bash
npx reporting-labs merge rl-shard1 rl-shard2 rl-shard3 rl-shard4 -o reporting-labs-merged
```

Then open `reporting-labs-merged/index.html`.

> Note: adjust the paths and script names above if your local setup differs. Everything is driven by `package.json` and the config files at the root.

---

## CI/CD

### Jenkins pipeline

The Contact List app is a single public website. It has no separate DEV, QA, STAGE or PROD deployments, so there was nothing real to deploy to. I still wanted to learn how a multi-environment pipeline is structured, so I built the full promotion flow in the `Jenkinsfile` and made the stages that can't really happen into placeholders:

| Stage | What it really does |
|---|---|
| Checkout SCM / Tool Install | Real: pulls the code and sets up Node |
| Build & Unit Tests | Real: compiles and fails fast on TypeScript errors |
| Install Dependencies | Real: `npm ci` and browsers |
| Deploy to DEV / QA / STAGE / PROD | Simulated: an `echo` that prints a success message |
| DEV – Sanity, STAGE – Sanity, PROD – Smoke | Run the `@smoke` tests against the public site |
| QA – Regression | Runs the full regression suite against the public site |
| Approval for PROD | Manual approval gate before the PROD stages |
| Post Actions | Archive reports, send email notification |

So every test stage runs against the same public URL. What the pipeline demonstrates is the *structure* (stage ordering, which test pack runs at which gate, an approval step, post-build reporting), not real deployments. In a company setup, the `echo` lines would be replaced with real deploy steps (Helm, Docker, a deploy script or an API call) and each environment would get its own base URL and credentials.

![Jenkins pipeline](docs/images/jenkins-pipeline.png)

### GitHub Actions

The workflow in `.github/` runs the suite split into shards that run in parallel (2 workers per shard, 4 workers in total). Reports and traces are uploaded as artifacts. It is currently set to `workflow_dispatch`, so I start it by hand from the **Actions** tab with the **Run workflow** button. It doesn't yet run automatically on pull requests or pushes (see Future improvements).

### Sharding and a merged report

Large suites get slow, so the run is split into shards. Each shard produces its own partial report, and the merge step combines them into one:

![Merging shard reports](docs/images/merge-reports.png)

```
Merging 4 shards into reporting-labs-merged
  merged: 56 tests · 56 passed · 0 failed · 0 flaky · 0 skipped
```

---

## Reports

Every run produces a report that shows pass rate, a full test table (spec, priority, owner, duration), duration distribution, and an environment summary (Playwright version, Node, OS, browser, commit, branch, workers, shards). Failing or retried tests keep their **trace** and **video** so I can replay exactly what happened.

![Test report](docs/images/report-overview.png)

A PDF copy of the latest report is in [`docs/Contact_List_regression_suite.pdf`](docs/Contact_List_regression_suite.pdf).

---

## Difficulties I ran into

This is the honest part. The finished project looks tidy; getting there wasn't.

**1. Keeping tests independent.**
The Contact List app keeps state per user, so tests that shared one account stepped on each other. I fixed it by creating a fresh user through the API at the start of each flow, which also made the tests faster than doing it through the UI.

**2. A workflow that never ran.**
My GitHub Actions workflow wasn't triggering at all. The `.yml` file referred to the `main` branch, but my repository's default branch is `master`. Changing the branch name in the workflow fixed it. It's a one-word change, but nothing in the Actions tab tells you that's the reason, so it took a while to spot.

**3. Docker runs failing with a confusing error.**
When I ran the suite in Docker, the same error kept coming back and the message itself didn't explain why. I opened the trace for the failed test and found a **503 (service unavailable)** response in the Network tab. The failure was the server, not my test code. Before that I was looking in the wrong place, and the trace is what pointed me to the right one.

**4. Building a multi-environment pipeline with only one environment.**
The app under test is one public site, so there was nothing real to deploy to. Rather than skip the idea, I built the full DEV → QA → STAGE → PROD structure and used `echo` for the deploy steps, while the sanity, regression and smoke stages run real tests. Getting the stage ordering, the approval gate and the Windows-based Jenkins setup (paths, tool installation) working took a lot of failed builds.

---

## Future improvements

- **Fill in test metadata**: only a handful of tests have a priority and owner right now, so the failure-category and trend charts in the report have little to show. Tagging every test with `priority` and `owner` fixes that.
- **Run CI automatically**: the GitHub Actions workflow is currently triggered only with `workflow_dispatch`, so I have to press **Run workflow** every time. The next step is adding `pull_request` (and `push` to `master`) triggers, so every change is tested before it's merged.
- **Real environments and deployments**: replace the `echo` deploy stages in the Jenkins pipeline with real deploy steps, and give each environment its own base URL and credentials, ideally by pointing at an app I host myself.

---

## About me

I'm Reshmi, an SDET and QA automation engineer based in the San Francisco Bay Area. Before moving into automation I worked as a systems engineer at TCS, and I volunteer on QA for the Oppia Foundation. This project is part of my portfolio, so feedback is very welcome.

- LinkedIn: [linkedin.com/in/reshmi-mahadevan](https://linkedin.com/in/reshmi-mahadevan)
- GitHub: [github.com/reshmimahadevan](https://github.com/reshmimahadevan)

---

## License

This project is for learning and portfolio purposes. Feel free to read, fork and learn from it.
