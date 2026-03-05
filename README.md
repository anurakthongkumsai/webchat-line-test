# WebChat - LINE Official Account

A web-based chat interface that sends and receives messages with a LINE Official Account in real time.

## Features

- Send messages from the web to LINE OA
- Receive messages from LINE OA via webhook (polling every 3s)
- Browser notifications and sound alerts for incoming messages
- Message grouping, date separators, unread badge, scroll-to-bottom
- Webhook signature verification (HMAC-SHA256)

## Tech Stack

- **Next.js 14** with TypeScript
- **Tailwind CSS**
- **LINE Messaging API**

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your LINE credentials:

```bash
cp .env.example .env.local
```

| Variable | Where to find it |
|---|---|
| `LINE_CHANNEL_ACCESS_TOKEN` | LINE Developers Console → Messaging API → Channel access token |
| `LINE_CHANNEL_SECRET` | LINE Developers Console → Basic settings → Channel secret |
| `LINE_USER_ID` | Your LINE User ID (starts with `U`) |

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Set up the webhook (for receiving messages)

Expose your local server with [ngrok](https://ngrok.com):

```bash
ngrok http 3000
```

Then set the Webhook URL in LINE Developers Console → Messaging API:

```
https://<your-ngrok-id>.ngrok-free.app/api/webhook
```

Enable **Use webhook** and click **Verify**.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── messages/route.ts        # Polling endpoint for the UI
│   │   ├── send-to-line/route.ts    # Push message to LINE OA
│   │   └── webhook/route.ts         # Receive LINE webhook events
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ChatBox.tsx                  # State management & orchestration
│   └── chat/
│       ├── ChatHeader.tsx
│       ├── ChatInput.tsx
│       ├── MessageBubble.tsx
│       └── MessageList.tsx
├── lib/
│   ├── config.ts                    # All constants and LINE server config
│   ├── messageStore.ts              # In-memory message store
│   └── utils.ts                     # Formatting and audio helpers
├── types/
│   └── chat.ts                      # Shared TypeScript types
└── .env.example
```

## Deploying to Vercel

1. Push to a public GitHub repository
2. Import the project on [Vercel](https://vercel.com)
3. Add the three environment variables in the Vercel dashboard
4. Update the Webhook URL in LINE Developers Console to your Vercel domain

> **Note:** The in-memory message store works within a single server instance. For multi-instance production deployments, replace it with a persistent store such as Vercel KV or Upstash Redis.
