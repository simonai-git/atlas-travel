# Atlas Travel Agent 🌍✈️

An AI-powered travel planning assistant with a ChatGPT-style interface. Built with Next.js 14+, TailwindCSS, and Claude AI.

## Features

- 💬 Conversational travel planning interface
- 🤖 Powered by Claude AI (Anthropic)
- 🎨 Beautiful dark theme UI with Shadcn/ui
- 💾 PostgreSQL database for conversation history
- 🚀 Deployed on Railway

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Styling:** TailwindCSS + Shadcn/ui
- **Database:** PostgreSQL (Railway)
- **AI:** Anthropic Claude API
- **Deployment:** Railway

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in your keys
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `NEXT_PUBLIC_APP_URL` | Public URL of the app |

## Deployment

This project is configured for Railway deployment. Push to main to auto-deploy.

## License

MIT
