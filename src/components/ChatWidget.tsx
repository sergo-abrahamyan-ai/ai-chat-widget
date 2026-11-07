"use client";

import { useEffect, useRef, useState } from "react";

type Message = { role: "user" | "bot"; text: string };

type ChatWidgetProps = {
  businessName: string;
  greeting: string;
  quickReplies?: string[];
};

// Плавающий чат в правом нижнем углу: кнопка открывает окно с сообщениями
export default function ChatWidget({ businessName, greeting, quickReplies = [] }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "bot", text: greeting }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // id сессии создаём при первом сообщении, а не при отрисовке (так требует Next.js)
  const sessionIdRef = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Прокручиваем вниз при новом сообщении
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || isLoading) return;

    const next: Message[] = [...messages, { role: "user", text: clean }];
    setMessages(next);
    setInput("");
    setIsLoading(true);
    sessionIdRef.current ??= crypto.randomUUID();
    const sessionId = sessionIdRef.current;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: clean, sessionId }),
      });
      const data: { reply?: string } = await res.json();
      setMessages(m => [...m, { role: "bot", text: data.reply || "Извините, попробуйте ещё раз." }]);
    } catch {
      setMessages(m => [...m, { role: "bot", text: "Нет связи. Позвоните нам, пожалуйста." }]);
    } finally {
      setIsLoading(false);
    }
  }

  const showQuickReplies = messages.length === 1 && quickReplies.length > 0;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="flex h-[520px] max-h-[calc(100vh-110px)] w-[360px] max-w-[calc(100vw-40px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center gap-3 bg-teal-600 px-4 py-3 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg">🤖</div>
            <div className="flex-1">
              <div className="font-semibold leading-tight">{businessName}</div>
              <div className="text-xs text-teal-100">AI-ассистент · отвечает 24/7</div>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded-md px-2 py-1 text-xl leading-none hover:bg-white/15" aria-label="Закрыть чат">
              ×
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-teal-600 px-3 py-2 text-sm text-white"
                      : "max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-sm text-slate-800 shadow-sm"
                  }
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-sm text-slate-400 shadow-sm">печатает…</div>
              </div>
            )}
            {showQuickReplies && (
              <div className="flex flex-wrap gap-2 pt-1">
                {quickReplies.map(q => (
                  <button key={q} onClick={() => send(q)} className="rounded-full border border-teal-600 px-3 py-1 text-xs text-teal-700 hover:bg-teal-50">
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={e => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2 border-t border-slate-200 bg-white p-3"
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Напишите сообщение…"
              maxLength={500}
              className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-800 outline-none focus:border-teal-600"
            />
            <button type="submit" disabled={isLoading || !input.trim()} className="rounded-full bg-teal-600 px-4 text-sm font-medium text-white disabled:opacity-40">
              ➤
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(o => !o)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-2xl text-white shadow-lg transition hover:scale-105"
        aria-label={isOpen ? "Закрыть чат" : "Открыть чат"}
      >
        {isOpen ? "×" : "💬"}
      </button>
    </div>
  );
}
