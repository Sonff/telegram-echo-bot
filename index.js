import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import http from 'http';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load environment variables from .env file
dotenv.config();

const token = process.env.BOT_TOKEN;
const geminiKey = process.env.GEMINI_API_KEY;

if (!token) {
  console.error('CRITICAL ERROR: BOT_TOKEN is not defined in the environment variables.');
  console.error('Please create a .env file based on .env.example and populate it with your Telegram bot token.');
  process.exit(1);
}

if (!geminiKey) {
  console.warn('\n⚠️  WARNING: GEMINI_API_KEY is not defined in the environment variables.');
  console.warn('The bot will start, but it will fallback to static replies instead of AI chat.');
  console.warn('👉 Get a free key from: https://aistudio.google.com/\n');
}

// Initialize the Telegraf bot
const bot = new Telegraf(token);

// Initialize Gemini API client if key is available
let geminiModel = null;
if (geminiKey) {
  try {
    const genAI = new GoogleGenerativeAI(geminiKey);
    // Use gemini-2.5-flash: fast, lightweight, and supports system instruction
    geminiModel = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
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

// Static fallback replies when Gemini API key is not present
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

// Handle text messages and respond using Gemini AI (or fallback to static echo)
bot.on('text', async (ctx) => {
  const prompt = ctx.message.text;

  // If Gemini model is initialized, use it to generate AI replies
  if (geminiModel) {
    try {
      // Send a "typing" status indicator to Telegram
      await ctx.sendChatAction('typing');

      // Call Gemini API to generate content
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const replyText = response.text();

      await ctx.reply(replyText);
    } catch (error) {
      console.error('Error generating content with Gemini:', error);
      // Fallback in case of API error (rate limits, key issues, etc.)
      await ctx.reply(`I'm sorry, my AI brain encountered an error. 🧠 Let me just echo what you said:\n\n"${prompt}"`);
    }
  } else {
    // If no Gemini API key is configured, use the friendly static fallback
    const fallbackText = getFriendlyFallbackReply(prompt);
    await ctx.reply(fallbackText);
  }
});

// Handle non-text messages (e.g. photos, stickers, documents) politely
bot.on('message', async (ctx) => {
  try {
    await ctx.reply("I can currently only chat with text messages! Try sending me some text. 📝");
  } catch (error) {
    console.error('Error handling non-text message:', error);
  }
});

// Start the bot using long polling
bot.launch()
  .then(() => {
    console.log('🚀 Telegram Bot is successfully running and listening for messages...');
  })
  .catch((err) => {
    console.error('Failed to launch the bot:', err);
  });

// Start a simple HTTP server to satisfy hosting platform health checks (like Render)
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running!');
}).listen(PORT, () => {
  console.log(`Health check server listening on port ${PORT}`);
});

// Enable graceful stop for termination signals
process.once('SIGINT', () => {
  console.log('\nStopping bot (SIGINT)...');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  console.log('\nStopping bot (SIGTERM)...');
  bot.stop('SIGTERM');
});
