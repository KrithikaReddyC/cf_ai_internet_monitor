# PROMPTS.md — AI Prompts Used in This Project

AI-assisted coding was used during development of this project as encouraged by the assignment guidelines.

---

## Prompt 1 — Project Architecture Design

**Tool:** Kiro AI (Claude-based)

**Prompt:**
> "I need to build an AI-powered application on Cloudflare that includes: Llama 3.3 on Workers AI, Workflow/coordination using Workflows or Durable Objects, user input via chat, and memory/state. What should I build and how should I structure it?"

**Used for:** Deciding on the Internet infrastructure chat assistant concept and the overall architecture (Worker + Durable Object + Workflow + static frontend).

---

## Prompt 2 — Durable Object for Session Memory

**Tool:** Kiro AI

**Prompt:**
> "Write a Cloudflare Durable Object in TypeScript that stores and retrieves chat message history using persistent storage."

**Used for:** `src/session.ts` — the `ChatSession` Durable Object class.

---

## Prompt 3 — Cloudflare Workflow for LLM Orchestration

**Tool:** Kiro AI

**Prompt:**
> "Write a Cloudflare Workflow in TypeScript with two steps: one to build a prompt from chat history, and one to call Llama 3.3 via Workers AI binding."

**Used for:** `src/workflow.ts` — the `ChatWorkflow` class.

---

## Prompt 4 — Worker Routing Logic

**Tool:** Kiro AI

**Prompt:**
> "Write a Cloudflare Worker that handles POST /chat (triggers workflow, saves to Durable Object) and DELETE /chat (clears session). Wire up the Durable Object and Workflow bindings."

**Used for:** `src/worker.ts` — main fetch handler.

---

## Prompt 5 — Chat UI Frontend

**Tool:** Kiro AI

**Prompt:**
> "Build a minimal dark-themed chat UI in plain HTML/CSS/JS that sends messages to POST /chat with a sessionId, displays responses, and has a clear button."

**Used for:** `public/index.html` — the frontend chat interface.

---

All generated code was reviewed, understood, and verified by the author.
