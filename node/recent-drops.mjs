// What restocked in the last day? Works on a free Reference key.
//   BUJUS_API_KEY=bjs_... node recent-drops.mjs
import { makeClient } from './client.mjs';

const callTool = makeClient();
const drops = await callTool('list_recent_drops', { sinceHours: 24, minConfidence: 'high', limit: 20 });
for (const d of drops) {
  const price = d.price == null ? '' : ` $${d.price}${d.msrp ? ` (MSRP $${d.msrp})` : ''}`;
  console.log(`${d.detectedAt}  ${d.retailer.padEnd(8)} ${d.title}${price}${d.endedAt ? '  [ended]' : ''}`);
}
