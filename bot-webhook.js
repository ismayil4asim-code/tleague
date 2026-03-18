// Supabase Edge Function: bot-webhook
// Деплой: supabase functions deploy bot-webhook
// Или через Supabase Dashboard → Edge Functions

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const BOT_TOKEN    = Deno.env.get('BOT_TOKEN')!;

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('ok', { status: 200 });
  }

  try {
    const update = await req.json();
    const msg = update?.message;
    if (!msg) return new Response('ok');

    const text = msg.text || '';
    const user = msg.from;

    // Обрабатываем /start TOKEN
    if (text.startsWith('/start ')) {
      const token = text.slice(7).trim();

      if (token) {
        // Обновляем токен в Supabase — записываем данные пользователя
        const res = await fetch(
          `${SUPABASE_URL}/rest/v1/auth_tokens?token=eq.${encodeURIComponent(token)}&status=eq.pending`,
          {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              status: 'confirmed',
              telegram_id: user.id,
              username: user.username || null,
              first_name: user.first_name || 'Игрок'
            })
          }
        );

        const updated = await res.json();

        // Отправляем приветствие пользователю
        if (updated && updated.length > 0) {
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: user.id,
              text: `✅ Вход выполнен!\n\n👋 Привет, ${user.first_name}! Ты успешно вошёл в T-League.\n\n⚽ Вернись на сайт — он уже загружается!`,
              parse_mode: 'HTML'
            })
          });
        } else {
          // Токен не найден или уже использован
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: user.id,
              text: `⚠️ Ссылка устарела или уже использована.\n\nВернись на сайт и нажми кнопку входа снова.`
            })
          });
        }
      } else {
        // Просто /start без токена — приветствие
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: user.id,
            text: `👋 Привет! Я бот T-League.\n\nЧтобы войти на сайт, нажми кнопку входа на <a href="https://tleague.vercel.app">tleague.vercel.app</a>`,
            parse_mode: 'HTML'
          })
        });
      }
    }

  } catch (e) {
    console.error('webhook error:', e);
  }

  return new Response('ok', { status: 200 });
});
