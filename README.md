# AI Chat Widget for Business Websites

A floating chat widget that answers customer questions 24/7 and books appointments. The demo is set up for a dental clinic: it knows prices and opening hours, collects the client's name, phone and preferred time, and hands the booking to the administrator.

**Stack:** Next.js (App Router) · React · TypeScript · Tailwind CSS · n8n · OpenAI

## How it works

```
Website widget  →  Next.js API route (/api/chat)  →  n8n webhook  →  AI Agent (OpenAI + chat memory)
      ↑                                                                        │
      └──────────────────────────────── reply ←────────────────────────────────┘
```

1. The visitor writes in the widget (`src/components/ChatWidget.tsx`).
2. The API route (`src/app/api/chat/route.ts`) validates the request, applies a rate limit and forwards the message to n8n with a secret key.
3. In n8n, an AI Agent with the clinic's information and per-session memory writes the reply.
4. The reply is shown in the chat.

Without an n8n URL the widget still works with simple built-in replies, so the demo never breaks.

## Security

- The n8n URL and secret key live only on the server (environment variables), never in the browser.
- The n8n webhook runs only when the request carries the correct secret key.
- Rate limit: 20 messages per 10 minutes per IP; message length is capped at 500 characters.
- The assistant answers only clinic topics and refuses anything else (code, role changes, revealing instructions).

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in the values
npm run dev
```

Open http://localhost:3000 and click the 💬 button.

| Variable | What it is |
| --- | --- |
| `N8N_CHAT_WEBHOOK_URL` | n8n webhook that returns `{ "reply": "..." }` |
| `N8N_WIDGET_KEY` | secret sent as the `x-widget-key` header; the webhook checks it |

## Adapting it for a business

Change the business name, greeting and quick replies in `src/app/page.tsx`, and the business information in the AI Agent's system message in n8n.

---

Built by Sergo Abrahamyan, AI automation · [SYNCRONIX AI](https://instagram.com/syncronix__ai)
