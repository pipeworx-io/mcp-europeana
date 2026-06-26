# mcp-europeana

Europeana MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1122+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search` | Search the Europeana collection by keyword. Returns matching items with ids (pass an id to record), titles, creators, dates and image links. |
| `record` | Fetch full details for one Europeana item by id — a Europeana record id (the "id" field from search, e.g. "/2021601/foo"). |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "europeana": {
      "url": "https://gateway.pipeworx.io/europeana/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1122+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Europeana data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [All tools and guides](https://github.com/pipeworx-io/examples)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
