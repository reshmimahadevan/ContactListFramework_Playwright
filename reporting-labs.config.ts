import 'reporting-labs/auto';   // records every request.* / page.request call in the report (remove to switch off)
import type { ReportingLabsOptions } from 'reporting-labs';

// reportingLabs configuration. Every option is optional; see the commented lines for the rest.
// Docs: https://github.com/naveenautomationlabs/reporting-labs#options

const config: ReportingLabsOptions = {

  // ── Look ─────────────────────────────────────────────────────────────────────
  title: 'Contact List – regression suite',          // shown in the header
  // logo: 'logo.png',                               // a file next to this config (embedded), or an https URL

  // ── Header details ───────────────────────────────────────────────────────────
  metadata: {                                         // chips in the header
    env: process.env.TEST_ENV ?? 'local',
  },

  // ── Output ───────────────────────────────────────────────────────────────────
  open: 'always',                                 // open the report in the browser: 'on-failure' | 'always' | 'never'; never in CI

  // ── Test details ─────────────────────────────────────────────────────────────
  // Values come from meta({ priority, severity, owner, feature, epic, story, ... }) in the tests.
  links: {                                            // turn meta keys into links; {id} is the value
    story: 'https://your-org.atlassian.net/browse/{id}',
    epic: 'https://your-org.atlassian.net/browse/{id}',
    issue: 'https://your-org.atlassian.net/browse/{id}',
  },

  // ── Run history and trend ────────────────────────────────────────────────────
  history: {
    enabled: true,
    file: 'reporting-labs.history.json',           // kept next to playwright.config; cache it in CI
    keep: 30,                                      // runs to remember
  },
};

export default config;
