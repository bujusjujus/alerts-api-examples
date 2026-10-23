// Minimal client for the bujusjujus Alerts API (remote MCP over Streamable HTTP).
// No dependencies: Node 18+ has fetch. Docs: https://bujusjujus.com/api

const ENDPOINT = 'https://bujusjuj.us/mcp';

export function makeClient(key = process.env.BUJUS_API_KEY) {
  if (!key || !key.startsWith('bjs_')) throw new Error('Set BUJUS_API_KEY to your bjs_ key (get one at https://bujusjujus.com/api-access)');
  let id = 0;
  return async function callTool(name, args = {}) {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method: 'tools/call', params: { name, arguments: args } }),
    });
    if (res.status === 429) {
      const wait = Number(res.headers.get('retry-after')) || 5;
      await new Promise(r => setTimeout(r, wait * 1000));
      return callTool(name, args);
    }
    const body = await res.json();
    if (body.error) throw new Error(`${res.status} ${body.error.message}`);
    const text = body.result && body.result.content && body.result.content[0] && body.result.content[0].text;
    if (body.result && body.result.isError) throw new Error(text || 'tool error');
    return JSON.parse(text);
  };
}
