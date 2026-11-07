// Принимает сообщение из чата и возвращает ответ.
// Если задан N8N_CHAT_WEBHOOK_URL (в .env.local) — пересылает в n8n, где отвечает AI.
// Если нет — отвечает простыми правилами, чтобы демо работало без сервера.

const MAX_MESSAGE_LENGTH = 500;
const RATE_LIMIT = 20; // сообщений
const RATE_WINDOW_MS = 10 * 60 * 1000; // за 10 минут с одного IP
const SESSION_ID_PATTERN = /^[0-9a-f-]{36}$/i;

// Простой лимит по IP в памяти сервера: защищает бюджет OpenAI от спама.
// На Vercel у каждого экземпляра своя память, поэтому это защита "по-быстрому", а не идеальная.
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter(t => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // не даём памяти расти бесконечно
  return recent.length > RATE_LIMIT;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return Response.json({ reply: "Слишком много сообщений. Попробуйте через несколько минут или позвоните нам." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ reply: "Некорректный запрос." }, { status: 400 });
  }

  const { message, sessionId } = (body ?? {}) as { message?: unknown; sessionId?: unknown };
  if (typeof message !== "string" || !message.trim() || typeof sessionId !== "string" || !SESSION_ID_PATTERN.test(sessionId)) {
    return Response.json({ reply: "Некорректный запрос." }, { status: 400 });
  }
  const text = message.trim().slice(0, MAX_MESSAGE_LENGTH);

  const webhook = process.env.N8N_CHAT_WEBHOOK_URL;
  if (!webhook) return Response.json({ reply: fallbackReply(text) });

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-widget-key": process.env.N8N_WIDGET_KEY ?? "" },
      body: JSON.stringify({ message: text, sessionId }),
      signal: AbortSignal.timeout(45_000),
    });
    const data = (await res.json()) as { reply?: unknown };
    const reply = typeof data.reply === "string" ? data.reply.trim() : "";
    return Response.json({ reply: reply || "Извините, не расслышал 🙂 Повторите, пожалуйста, вопрос." });
  } catch {
    return Response.json({ reply: "Сервис временно недоступен. Позвоните нам, пожалуйста." });
  }
}

function fallbackReply(text: string): string {
  const t = text.toLowerCase();
  if (/цен|стоит|сколько|price/.test(t))
    return "Консультация — 5 000 ֏, чистка — 15 000 ֏, пломба — от 20 000 ֏. Точную цену врач скажет после осмотра. Хотите записаться?";
  if (/запис|прием|приём|book/.test(t))
    return "С удовольствием запишу вас! Напишите, пожалуйста: имя, телефон и удобный день.";
  if (/час|время|работ|открыт|hours/.test(t)) return "Мы работаем Пн–Сб с 10:00 до 20:00, воскресенье — выходной.";
  if (/адрес|где|наход/.test(t)) return "Мы находимся в центре Еревана. Точный адрес пришлю вместе с подтверждением записи.";
  if (/\+?\d[\d\s-]{7,}/.test(t)) return "Спасибо! Администратор свяжется с вами в течение 15 минут, чтобы подтвердить время.";
  return "Я AI-ассистент клиники. Могу рассказать о ценах, графике работы или записать вас на приём.";
}
