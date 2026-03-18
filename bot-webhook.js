// api/bot-webhook.js
// Telegram шлёт сюда апдейты когда пользователь нажимает /start TOKEN в боте

const BOT_TOKEN = process.env.BOT_TOKEN; // Добавь в Vercel Environment Variables

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const update = req.body;
  const msg = update?.message;
  if (!msg) return res.status(200).end();

  const text = msg.text || '';
  const user = msg.from;

  // Обрабатываем /start TOKEN
  if (text.startsWith('/start ')) {
    const token = text.slice(7).trim();
    const tokens = globalThis._tl_tokens;

    if (tokens && tokens.has(token)) {
      // Сохраняем данные пользователя в токен
      tokens.set(token, {
        status: 'confirmed',
        created: Date.now(),
        user: {
          id: user.id,
          username: user.username || null,
          first_name: user.first_name || 'Игрок',
          photo_url: null
        }
      });

      // Отправляем сообщение пользователю в бота
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: user.id,
          text: `✅ Ты успешно вошёл в T-League!\n\n👋 Добро пожаловать, ${user.first_name}!\n\nВернись на сайт — он автоматически откроется.`,
          parse_mode: 'HTML'
        })
      });
    }
  }

  res.status(200).end();
}
