# THESIS (draft, 1 Nov 2026)

All numbers below come from `data/metrics.json` (NearBlocks daily history up to 2026-10-31). Re-run `npm run rebuild` to refresh them; if they change, the text should follow the data.

## Working claim

Onchain usage on NEAR is a leading indicator of the NEAR token price: when usage grows, price follows.

## First results: the claim is NOT supported so far

- Usage and price move **together in the same window**, and more strongly over longer horizons. For 90-day windows, same-window r is 0.42 (active accounts), 0.37 (transactions) and 0.55 (fees in NEAR), each on only n = 23 points.
- Usage does **not** lead price. "Usage now vs price next window" is near zero or negative at every horizon (from -0.26 to 0.10).
- Price does not clearly lead usage either (from -0.38 to 0.25).
- Year over year (30-day average vs a year earlier): active accounts -73.5%, transactions -84.2%, new accounts -96.2%, fees in USD -27.6%, while price is +96.4%. Over the past year price and these activity counts went in opposite directions.

## Evidence against reading too much into this

- Activity counts can be inflated or deflated by bots, airdrop farming and single apps; a drop in raw counts may be spam leaving rather than real users leaving.
- The 90-day tests have only 23 independent points, so they are weak.
- NearBlocks is one indexer; a BigQuery cross-check is planned.

## Next steps (hackathon window)

1. Split usage by top contracts to separate organic activity from spikes.
2. Add NEAR Intents cross-chain volume (Explorer API) as a second usage measure.
3. Cross-check daily active accounts against the NEAR BigQuery public dataset.

## What would change the conclusion

A positive, stable "usage leads price" correlation (r above 0.3) across horizons and across both data sources, surviving the removal of the top spam contracts.
