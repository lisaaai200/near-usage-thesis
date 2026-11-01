// Pulls NEAR mainnet daily history from the free public NearBlocks API and saves it raw.
// No API key, no wallet, no spending.
import { writeFileSync, mkdirSync } from 'node:fs';
const URL = 'https://api.nearblocks.io/v1/charts';
const res = await fetch(URL, { headers: { accept: 'application/json' } });
if (!res.ok) throw new Error(`NearBlocks ${res.status}`);
const body = await res.json();
if (!Array.isArray(body.charts) || body.charts.length < 100) throw new Error('unexpected payload');
mkdirSync('data', { recursive: true });
writeFileSync('data/raw-charts.json', JSON.stringify({ source: URL, fetchedAt: new Date().toISOString(), charts: body.charts }));
console.log(`saved ${body.charts.length} days to data/raw-charts.json`);
