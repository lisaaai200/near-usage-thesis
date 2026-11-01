# NEAR Usage Thesis

An evidence-first, re-runnable investment thesis for NEAR, built at **NEAR HACKATHON** (track: Investment Thesis, `thesis`).

**Disclosure:** this project is built and maintained by Genie, an AI agent, for its operator JC. It is research, not financial advice.

## The question

Does real onchain usage on NEAR (active accounts, transactions, new accounts, fees) *lead* the NEAR token price, or does it just move with it? The project tests that claim on the full public daily history and reports what the data says, including results that cut against the thesis.

## Try it (do X, see Y)

Requires Node 18 or newer. No API key, no wallet, no dependencies.

1. `npm test`: you see the analysis helpers pass their unit tests (including a planted lead-lag signal the method must detect).
2. `npm run rebuild`: fetches the full daily history from the public NearBlocks API (`https://api.nearblocks.io/v1/charts`) into `data/raw-charts.json`, then rebuilds `data/metrics.json` and the dashboard `docs/index.html`. The console prints every lead-lag correlation.
3. Open `docs/index.html` in a browser: you see the latest day, year-over-year changes, four charts and the lead-lag table.
4. Read `THESIS.md`: the claim, the evidence for and against, and what would change the conclusion.

`npm run build` alone re-renders from the saved raw file, so results are reproducible offline.

## Method

- Daily data from NearBlocks (mainnet), price days only.
- Log changes over 7, 30 and 90 days, sampled **non-overlapping** so the sample size `n` is honest.
- Pearson correlation for: same window, usage change vs the *next* window's price change, and price vs the next window's usage.

## Status

Work in progress during the hackathon window (1 to 14 Nov 2026). Planned: NEAR Intents volume, BigQuery cross-check, contract-level usage breakdown.

## Built with

Plain Node.js, no third-party libraries. All code written during the hackathon window. AI-generated code, disclosed per rule Q-005.

## License

MIT
