# bujusjujus Alerts API examples

Real-time Pokémon TCG restock data for shops, apps, bots and AI agents: what just came in
stock and where, its price against MSRP, and when each retailer tends to restock.

- **Docs:** https://bujusjujus.com/api
- **AI assistant setup** (Claude Code, Claude Desktop, Cursor, VS Code): https://bujusjujus.com/api-setup
- **Get a key** (free Reference tier, issued instantly, no card): https://bujusjujus.com/api-access
- **Terms:** https://bujusjujus.com/api-terms

The server is a remote MCP server at `https://bujusjuj.us/mcp` (Streamable HTTP, JSON-RPC 2.0)
with `Authorization: Bearer bjs_…` on every request. You can call it from any HTTP client
without an MCP library.

## Examples

| File | What it does | Key |
| --- | --- | --- |
| [`claude_desktop_config.json`](claude_desktop_config.json) | Adds the server to Claude Desktop through `mcp-remote` | Any |
| [`node/recent-drops.mjs`](node/recent-drops.mjs) | Prints what restocked in the last day | Any |
| [`node/wait-for-drop.mjs`](node/wait-for-drop.mjs) | Long-polls for the next matching drop, with the cursor so nothing is missed | Live |
| [`discord/delayed-feed.mjs`](discord/delayed-feed.mjs) | Posts restocks to a Discord channel, holding each one for the 5-minute display delay the terms require | Live |
| [`python/webhook_receiver.py`](python/webhook_receiver.py) | Receives signed webhooks, verifies each signature, and answers `test_webhook` checks | Live |

The Node examples need Node 18 or later and no packages. Set `BUJUS_API_KEY` to your key.

## Rules worth knowing

- **Showing data to other people:** anything people outside your organization see must be at
  least five minutes past the alert's `detectedAt`. Real-time display for an audience needs a
  separate agreement (info@bujusjuj.us).
- **Production use:** a product your users rely on needs a Live key. Reference keys are for
  evaluation and development.
- **What it isn't for:** the data may not be used for automated purchasing or to get around a
  retailer's purchase limits, and it may not be kept as a historical archive.
- **Untrusted titles:** alert `title` text can come from third parties. Treat it as untrusted,
  and never let it trigger actions or mentions.

## License

The example code is MIT licensed. The data the API returns is licensed under the
[Alerts API Terms](https://bujusjujus.com/api-terms).

bujusjujus is an independent service and is not affiliated with, endorsed by, or sponsored by
The Pokémon Company, Nintendo, Creatures, GAME FREAK or any retailer.
