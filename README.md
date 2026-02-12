# Aivestor Frontend

Next.js 15 dashboard with React 19, TailwindCSS 4, real-time data via Socket.IO, and Firebase Authentication.

## Setup

```bash
cp .env.example .env.local    # fill in your keys
npm install
npm run dev                   # starts on http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Public landing page |
| `/login` | Login | Email/password + Google Sign-In |
| `/register` | Register | New account creation |
| `/forgot-password` | Password Reset | Request password reset email |
| `/onboarding` | Onboarding | Risk profile questionnaire |
| `/dashboard` | Dashboard | Portfolio overview, charts, live alerts |
| `/portfolio` | Portfolio | Holdings detail, performance metrics |
| `/chat` | AI Chat | Gemini-powered investment chatbot |
| `/brokerage` | Brokerage | Connect brokers, sync, trade simulation |
| `/settings` | Settings | Profile & preferences |

## Key Features

- **Real-time alerts** — WebSocket connection for live price updates
- **Interactive charts** — Chart.js / Recharts for portfolio visualization
- **AI chatbot** — Gemini-powered investment assistant
- **Brokerage integration** — Connect, sync, and simulate trades
- **Risk profiling** — Onboarding questionnaire with AI-recommended portfolio

## Testing

```bash
npm test                      # unit tests
npm run e2e                   # Playwright end-to-end tests
```

## Project Structure

```
├── app/
│   ├── components/           # Shared UI components
│   │   └── Navigation.js     # Sidebar navigation
│   ├── lib/
│   │   ├── firebase.js       # Firebase client config
│   │   ├── firestore.service.js  # Firestore CRUD + subscriptions
│   │   ├── toast.js          # Toast notification helpers
│   │   └── notifications.js  # Notification re-exports
│   ├── dashboard/page.js     # Main dashboard
│   ├── portfolio/page.js     # Portfolio detail
│   ├── chat/page.js          # AI chatbot
│   ├── brokerage/page.js     # Brokerage management
│   ├── settings/page.js      # User settings
│   ├── login/page.js
│   ├── register/page.js
│   ├── onboarding/page.js
│   └── layout.js             # Root layout
├── public/                   # Static assets
├── tests/                    # Test suites
├── .env.example
└── package.json
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (default `http://localhost:5000`) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
