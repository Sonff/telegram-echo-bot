# Telegram AI Chatbot (shayan_your_friendly_bot)

A powerful, beginner-friendly Telegram AI Chatbot built with Node.js, the [Telegraf](https://github.com/telegraf/telegraf) framework, and dual AI engine support: **Groq API (Llama 3.3)** and **Google Gemini API** (gemini-2.0-flash-lite). 

The bot acts as a warm, friendly conversational assistant. It can chat, answer questions, explain code, write stories, and translate languages, and it understands almost **every global language**.

---

## Features

- **Dual AI Engine Support:**
  - **Groq Llama 3.3 (Primary):** Extremely fast, intelligent, and comes with a massive free tier of **14,400 messages per day**!
  - **Google Gemini (Secondary Fallback):** Auto-falls back to Gemini if Groq encounters issues or rate limits.
- **Multilingual Support:** Converses fluently in Hindi, Urdu, English, Spanish, Arabic, and dozens of other languages.
- **Warm & Friendly Persona:** Customized system prompts instruct the AI to behave as a friendly companion.
- **Robust Redundancy:** If both AI keys are missing, the bot falls back gracefully to a friendly static echo bot instead of crashing.
- **Production Webhook Mode:** Automatically switches to Webhook mode when hosted on Render (using `RENDER_EXTERNAL_URL`) to wake the server up when a message is received, solving the free-tier sleep issue.
- **Graceful Shutdown:** Cleans up and stops polling gracefully on process termination signals (`SIGINT`, `SIGTERM`).

---

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **NPM** (Node Package Manager)

---

## Setup & Installation

### 1. Clone or copy files
Ensure you have the following files in your workspace directory:
- `package.json`
- `index.js`
- `.env`
- `.gitignore`

### 2. Install dependencies
Run the following command to install the required packages:
```bash
npm install
```

### 3. Get a Telegram Bot Token
1. Open Telegram and search for [@BotFather](https://t.me/BotFather) (the official bot with the blue verified badge).
2. Start a conversation and send the `/newbot` command.
3. Follow the instructions to choose a name (e.g., `shayan_your_friendly_bot`) and a unique username ending in `bot`.
4. Copy the HTTP API token provided by BotFather.

### 4. Get a Groq API Key (Recommended - 14,400 messages/day)
1. Go to **[console.groq.com](https://console.groq.com/)**.
2. Sign up with your Google account or email (completely free).
3. Click on **API Keys** in the left menu, then click **Create API Key**.
4. Copy the key starting with `gsk_`.

### 5. Get a Google Gemini API Key (Optional Fallback)
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Click on the **Create API key** button.
3. Copy the generated API key starting with `AIzaSy`.

### 6. Configure Environment Variables
Open the `.env` file in the root of the project and populate your keys:
```env
BOT_TOKEN=your_telegram_bot_token_here
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

---

## Running the Bot

### Development Mode (with auto-reload)
To run the bot in development mode where it auto-restarts on any file change:
```bash
npm run dev
```

### Production Mode / Hosting
To run the bot in production mode:
```bash
npm start
```

---

## Deploying to Render (24/7 Hosting)

1. Push your code to your GitHub repository.
2. Log in to **[Render](https://dashboard.render.com/)** using your GitHub account.
3. Click **New +** -> **Web Service**.
4. Connect your repository.
5. Configure the service:
   - **Name**: `shayan-friendly-bot`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free**
6. Click **Environment Variables** and add the following keys:
   - `BOT_TOKEN`
   - `GROQ_API_KEY`
   - `GEMINI_API_KEY`
7. Click **Deploy Web Service**.