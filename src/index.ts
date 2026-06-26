interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Europeana MCP.
 *
 * Europeana — 50M+ digitised cultural-heritage objects (art, books, photos, audio) from European museums, libraries & archives. FREE API key required (get one at https://pro.europeana.eu/page/get-api (free)); the platform
 * provides it automatically, or pass your own via _apiKey (BYOK).
 */


const BASE = 'https://api.europeana.eu/record/v2';
const UA = 'pipeworx-mcp-europeana/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'search',
    description: 'Search the Europeana collection by keyword. Returns matching items with ids (pass an id to record), titles, creators, dates and image links.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Keyword(s), e.g. "rembrandt", "ceramics", "moon landing".' },
        limit: { type: 'number', description: 'Max results (1-100, default 20).' },
        page: { type: 'number', description: 'Page number (1-based, default 1).' },
        _apiKey: { type: 'string', description: 'Europeana API key (auto-injected by the platform; or pass your own).' },
      },
      required: ['query'],
    },
  },
  {
    name: 'record',
    description: 'Fetch full details for one Europeana item by id — a Europeana record id (the "id" field from search, e.g. "/2021601/foo").',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'e.g. "2021601/foo".' },
        _apiKey: { type: 'string', description: 'Europeana API key (auto-injected by the platform; or pass your own).' },
      },
      required: ['id'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const key = typeof args._apiKey === 'string' ? args._apiKey : '';
  delete args._apiKey;
  if (!key) throw new Error('Europeana API key required. Get one free at https://pro.europeana.eu/page/get-api (free) and pass via _apiKey (the platform key may not be configured yet).');
  switch (name) {
    case 'search': {
      const limit = clamp(numArg(args.limit, 20), 1, 100);
      const page = Math.max(1, numArg(args.page, 1));
      const p = new URLSearchParams({ 'wskey': key, 'query': String(args.query ?? ''), 'rows': String(limit) });
      // Europeana's `start` is 1-based — page 1 must send start=1, not 0
      // (start=0/negative → "400 'start' parameter cannot be negative").
      p.set('start', String((page - 1) * limit + 1));
      return get(`${BASE}/search.json?${p}`);
    }
    case 'record': {
      const id = reqStr(args, 'id', '"2021601/foo"');
      return get(`${BASE}/${encodeURIComponent(id)}.json?wskey=${encodeURIComponent(key)}`);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function get(url: string): Promise<unknown> {
  const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (res.status === 401 || res.status === 403) throw new Error('Europeana: wskey rejected (invalid/expired key). Get a free key at https://pro.europeana.eu/page/get-api (free).');
  if (!res.ok) throw new Error(`Europeana: ${res.status} ${await res.text().then((t) => t.slice(0, 160))}`);
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}
function numArg(v: unknown, dflt: number): number { const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN; return Number.isFinite(n) ? n : dflt; }
function clamp(n: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, Math.trunc(n))); }

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
