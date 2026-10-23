// A restock feed for a Discord channel, following the API terms: anything shown to
// people outside your organization must be at least five minutes past the alert's
// detectedAt (https://bujusjujus.com/api-terms, section 4). Real-time posting to an
// audience needs a separate agreement: info@bujusjuj.us.
//
// Needs a Live key (a product your users rely on needs Live) and a Discord channel
// webhook URL (channel settings → Integrations → Webhooks).
//   BUJUS_API_KEY=bjs_... DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/... node delayed-feed.mjs
import { makeClient } from '../node/client.mjs';

const DISPLAY_DELAY_MS = 5 * 60 * 1000;
const webhook = process.env.DISCORD_WEBHOOK_URL;
if (!webhook) throw new Error('Set DISCORD_WEBHOOK_URL');

const callTool = makeClient();
const seen = new Set();
const queue = []; // alerts waiting out the display delay, oldest first
let cursor;

async function post(alert) {
  const price = alert.price == null ? '' : ` — $${alert.price}${alert.msrp ? ` (MSRP $${alert.msrp})` : ''}`;
  const status = alert.endedAt ? ' (already sold out)' : '';
  await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `**${alert.retailer}**: ${alert.title}${price}${status}\n${alert.productUrl ?? ''}\nData from bujusjujus`,
      allowed_mentions: { parse: [] }, // titles are third-party text: never let them ping anyone
    }),
  });
}

// Release anything whose display delay has passed.
setInterval(async () => {
  while (queue.length && Date.parse(queue[0].detectedAt) + DISPLAY_DELAY_MS <= Date.now()) {
    const alert = queue.shift();
    try { await post(alert); } catch (err) { console.error('discord:', err.message); }
  }
}, 15_000);

for (;;) {
  try {
    const r = await callTool('wait_for_drop', { cursor, timeoutSec: 20 });
    cursor = r.cursor;
    for (const alert of r.alerts) {
      if (seen.has(alert.id)) continue;
      seen.add(alert.id);
      queue.push(alert);
    }
  } catch (err) {
    console.error(err.message);
    await new Promise(r => setTimeout(r, 5000));
  }
}
