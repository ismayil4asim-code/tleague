// api/auth-start.js
// Генерирует уникальный токен и сохраняет в KV (или просто в памяти для простоты)
// Возвращает ссылку на бота с токеном

const tokens = new Map(); // В продакшене используй Vercel KV или Redis

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Генерируем случайный токен
  const token = Math.random().toString(36).slice(2) + Date.now().toString(36);

  // Сохраняем токен (ждёт подтверждения от бота)
  tokens.set(token, { status: 'pending', created: Date.now() });

  // Чистим старые токены (старше 10 минут)
  for (const [k, v] of tokens) {
    if (Date.now() - v.created > 600000) tokens.delete(k);
  }

  // Передаём tokens через globalThis чтобы другой endpoint мог читать
  globalThis._tl_tokens = tokens;

  res.json({ token, botUrl: `https://t.me/tleaguebot?start=${token}` });
}
