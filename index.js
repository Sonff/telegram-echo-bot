import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import http from 'http';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

// Load environment variables from .env file
dotenv.config();

const token = process.env.BOT_TOKEN;
const geminiKey = process.env.GEMINI_API_KEY;
const groqKey = process.env.GROQ_API_KEY;

if (!token) {
  console.error('CRITICAL ERROR: BOT_TOKEN is not defined in the environment variables.');
  console.error('Please create a .env file based on .env.example and populate it with your Telegram bot token.');
  process.exit(1);
}

// Log warning if both API keys are missing
if (!geminiKey && !groqKey) {
  console.warn('\n⚠️  WARNING: Neither GEMINI_API_KEY nor GROQ_API_KEY is defined in the environment variables.');
  console.warn('The bot will start, but it will fallback to static replies instead of AI chat.');
}

// Initialize the Telegraf bot
const bot = new Telegraf(token);

// Initialize Gemini API client if key is available
let geminiModel = null;
if (geminiKey) {
  try {
    const genAI = new GoogleGenerativeAI(geminiKey);
    geminiModel = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      systemInstruction:
        "You are shayan_your_friendly_bot, a warm, polite, and helpful AI assistant created by Shayan. " +
        "You understand and speak all languages in the world fluently. " +
        "Always respond in a very friendly, encouraging, and natural conversational manner. " +
        "Use emojis where appropriate. Keep your answers relatively concise, readable, and engaging.",
    });
    console.log('🤖 Google Gemini AI engine successfully initialized!');
  } catch (error) {
    console.error('Failed to initialize Gemini AI client:', error);
  }
}

// Initialize Groq API client if key is available
let groqClient = null;
if (groqKey) {
  try {
    groqClient = new Groq({ apiKey: groqKey });
    console.log('🤖 Groq Llama AI engine successfully initialized!');
  } catch (error) {
    console.error('Failed to initialize Groq AI client:', error);
  }
}

// Middleware to log incoming updates (useful for debugging)
bot.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  const username = ctx.from?.username || ctx.from?.first_name || 'unknown user';
  const messageType = ctx.message ? Object.keys(ctx.message)[ctx.message ? Object.keys(ctx.message).length - 1 : 0] : 'other';
  console.log(`[Bot] Request from @${username} (type: ${messageType}) processed in ${ms}ms`);
});

// /start command handler
bot.start((ctx) => {
  return ctx.reply("Welcome to shayan_your_friendly_bot");
});

// /help command handler
bot.help((ctx) => {
  return ctx.reply(
    `Hello! Here's how you can chat with me:\n\n` +
    `• Just send me any message in any language, and I will chat with you like a friend!\n` +
    `• /start - Start or restart the conversation.\n` +
    `• /help - Display this help instructions.`
  );
});

// Static fallback replies when AI API keys are not present
function getFriendlyFallbackReply(text) {
  const cleanText = text.trim().toLowerCase();
  
  if (cleanText === 'hi' || cleanText === 'hello' || cleanText === 'hey') {
    return 'Hello! 😊';
  }
  if (cleanText === 'how are u' || cleanText === 'how are you' || cleanText === 'how r u') {
    return 'I am doing great, thank you for asking! How are you doing today?';
  }
  if (cleanText === 'thanks' || cleanText === 'thank you') {
    return "You're very welcome! Always happy to help. ❤️";
  }
  
  // Default fallback: echo the exact text back
  return text;
}

// Handle text messages and respond using Groq AI (primary) or Gemini AI (secondary)
bot.on('text', async (ctx) => {
  const prompt = ctx.message.text;

  // 1. Try Groq (Llama 3.3) first if initialized
  if (groqClient) {
    try {
      await ctx.sendChatAction('typing');
      const response = await groqClient.chat.completions.create({
        messages: [
          {
            role: 'system',
            content:
              "You are shayan_your_friendly_bot, a warm, polite, and helpful AI assistant created by Shayan. " +
              "You understand and speak all languages in the world fluently. " +
              "Always respond in a very friendly, encouraging, and natural conversational manner. " +
              "Use emojis where appropriate. Keep your answers relatively concise, readable, and engaging.",
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: 'llama-3.3-70b-versatile',
      });
      const replyText = response.choices[0].message.content;
      return await ctx.reply(replyText);
    } catch (groqError) {
      console.error('Groq AI error, attempting Gemini fallback:', groqError);
      // If Groq fails (e.g. rate limit), fall through to Gemini fallback
    }
  }

  // 2. Fallback to Gemini if Groq fails or is not initialized
  if (geminiModel) {
    try {
      await ctx.sendChatAction('typing');
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const replyText = response.text();
      return await ctx.reply(replyText);
    } catch (geminiError) {
      console.error('Gemini AI error:', geminiError);
      // If Gemini also fails, display error for easy debugging
      return await ctx.reply(`I'm sorry, my AI brains encountered errors. 🧠\n\nGemini error details: ${geminiError.message || geminiError}`);
    }
  }

  // 3. Fallback to static friendly echo if no AI engines are working
  const fallbackText = getFriendlyFallbackReply(prompt);
  await ctx.reply(fallbackText);
});

// Handle non-text messages (e.g. photos, stickers, documents) politely
bot.on('message', async (ctx) => {
  try {
    await ctx.reply("I can currently only chat with text messages! Try sending me some text. 📝");
  } catch (error) {
    console.error('Error handling non-text message:', error);
  }
});

const PORT = process.env.PORT || 3000;
const domain = process.env.RENDER_EXTERNAL_URL;

if (domain) {
  // Production Webhook Mode on Render
  bot.launch({
    webhook: {
      domain: domain,
      port: parseInt(PORT, 10),
    },
  })
    .then(() => {
      console.log(`🚀 Bot successfully running on Webhook mode at ${domain}`);
    })
    .catch((err) => {
      console.error('Failed to launch bot in webhook mode:', err);
    });
} else {
  // Local Polling Mode for development
  bot.launch()
    .then(() => {
      console.log('🚀 Bot successfully running on local Polling mode...');
    })
    .catch((err) => {
      console.error('Failed to launch bot in polling mode:', err);
    });

  // Start a simple HTTP server to satisfy local port checks
  http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running locally!');
  }).listen(PORT, () => {
    console.log(`Local health check server listening on port ${PORT}`);
  });
}

// Enable graceful stop for termination signals
process.once('SIGINT', () => {
  console.log('\nStopping bot (SIGINT)...');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  console.log('\nStopping bot (SIGTERM)...');
  bot.stop('SIGTERM');
});
