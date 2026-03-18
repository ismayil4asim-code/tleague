// api/auth-check.js
// Фронтенд каждые 2 секунды спрашивает: "токен подтверждён?"

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'no token' });

  const tokens = globalThis._tl_tokens;
  if (!tokens || !tokens.has(token)) {
    return res.json({ status: 'not_found' });
  }

  const data = tokens.get(token);

  if (data.status === 'confirmed') {
    // Удаляем токен после использования
    tokens.delete(token);
    return res.json({ status: 'confirmed', user: data.user });
  }

  res.json({ status: 'pending' });
}
