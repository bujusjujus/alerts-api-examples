// Wait for the next matching drop, forever, without missing or repeating one.
// Needs a Live key.
//   BUJUS_API_KEY=bjs_... node wait-for-drop.mjs "Pitch Black"
import { makeClient } from './client.mjs';

const callTool = makeClient();
const query = process.argv[2] || '';
const seen = new Set();
let cursor;

for (;;) {
  try {
    const r = await callTool('wait_for_drop', { cursor, query, maxMarkupPct: 10, timeoutSec: 20 });
    cursor = r.cursor;                 // always pass it back: nothing is missed between calls
    for (const alert of r.alerts) {
      if (seen.has(alert.id)) continue; // ids are stable; dedupe on them
      seen.add(alert.id);
      console.log(`${alert.retailer}: ${alert.title} $${alert.price ?? '?'} → ${alert.productUrl ?? '(no link)'}`);
    }
  } catch (err) {
    console.error(err.message);
    await new Promise(r => setTimeout(r, 5000));
  }
}
