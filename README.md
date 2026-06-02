# Telegram AI Chatbot (shayan_your_friendly_bot)

A powerful, beginner-friendly Telegram AI Chatbot built with Node.js, the [Telegraf](https://github.com/telegraf/telegraf) framework, and the **Google Gemini API** (`gemini-1.5-flash`). 

The bot acts as a warm, friendly conversational assistant. It can chat, answer questions, explain code, write stories, and translate languages, and it understands almost **every global language**.

---

## Features

- **Google Gemini AI Chat:** Real-time conversational AI like ChatGPT.
- **Multilingual Support:** Converses fluently in Hindi, Urdu, English, Spanish, Arabic, and dozens of other languages.
- **Warm & Friendly Persona:** Set up with custom system instructions to behave as a friendly companion.
- **Graceful Fallback:** If the Gemini API key is missing or encounters issues, the bot falls back to a friendly echo bot rather than crashing.
- **Hosting-ready Built-in Web Server:** Includes a tiny server listening on `PORT` to pass hosting platform health checks (like Render).
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
Run the following command to install the required packages (Telegraf, dotenv, and Google Generative AI SDK):
```bash
npm install
```

### 3. Get a Telegram Bot Token
1. Open Telegram and search for [@BotFather](https://t.me/BotFather) (the official bot with the blue verified badge).
2. Start a conversation and send the `/newbot` command.
3. Follow the instructions to choose a name (e.g., `shayan_your_friendly_bot`) and a unique username ending in `bot`.
4. Copy the HTTP API token provided by BotFather.

### 4. Get a Google Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Login with your Google account.
3. Click on the **Create API key** button.
4. Copy the generated API key.

### 5. Configure Environment Variables
Open the `.env` file in the root of the project and add both keys:
```env
BOT_TOKEN=your_telegram_bot_token_here
GEMINI_API_KEY=your_gemini_api_key_here
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

Once running, you should see:
```text
🤖 Google Gemini AI engine successfully initialized!
🚀 Telegram Bot is successfully running and listening for messages...
Health check server listening on port 3000
```

---

## Testing your Bot
1. Go to Telegram and search for your bot using its username (e.g., `@shayan_learning_echo_bot`).
2. Click **Start** (or send `/start`). The bot will reply with **"Welcome to shayan_your_friendly_bot"**.
3. Send `/help` to view instructions.
4. Start chatting! You can ask questions in Hindi/Urdu (e.g., *"tum kaise ho?"*), English (*"write a short poem"*), or any other language.
