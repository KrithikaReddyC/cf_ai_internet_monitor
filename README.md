# cf_ai_internet_monitor

An AI-powered Internet infrastructure chat assistant built on Cloudflare.

Ask questions about DNS, BGP, DDoS, CDN, networking, and Cloudflare technologies — the assistant remembers your conversation and responds using Llama 3.3.

## Architecture

| Component | Technology |
|---|---|
| LLM | Llama 3.3 70B via Cloudflare Workers AI |
| Workflow / Coordination | Cloudflare Workflows (multi-step prompt building + LLM call) |
| Memory / State | Durable Objects (per-session conversation history in persistent storage) |
| User Input | Chat UI served via Cloudflare Workers Assets (Pages-style) |

## Project Structure

```
src/
  worker.ts     # Main Worker — routing, request handling
  session.ts    # Durable Object — conversation memory per session
  workflow.ts   # Cloudflare Workflow — multi-step LLM processing
public/
  index.html    # Chat UI frontend
wrangler.toml   # Cloudflare config
```

## Running Locally

**Prerequisites:** Node.js, wrangler CLI, Cloudflare account with Workers AI enabled.

```bash
git clone https://github.com/KrithikaReddyC/cf_ai_internet_monitor
cd cf_ai_internet_monitor
npm install
npm run dev
```

Open http://localhost:8787 in your browser.

> Note: Workers AI runs remotely even in local dev — wrangler proxies AI calls to Cloudflare's network. You must be logged in (`wrangler login`).

## Deploying to Cloudflare

```bash
npm run deploy
```

Wrangler will output a live URL. Deployed at: **https://cf-ai-internet-monitor.kcherukupally1.workers.dev**

## How It Works

1. User types a message in the chat UI
2. The Worker receives the POST `/chat` request
3. It fetches conversation history from the **Durable Object** for that session
4. It triggers a **Cloudflare Workflow** which:
   - Step 1: Builds the full prompt (system prompt + history + new message)
   - Step 2: Calls **Llama 3.3** via Workers AI
5. The reply is saved back to the Durable Object and returned to the UI
6. The UI displays the streamed response

## Example Questions to Try

- "How does BGP route traffic across the Internet?"
- "What is anycast and how does Cloudflare use it?"
- "Explain how a DDoS attack works and how it's mitigated"
- "What happens during a DNS lookup?"
- "How does Cloudflare's 1.1.1.1 differ from Google's 8.8.8.8?"
