import ChatWidget from "@/components/ChatWidget";

// Демо-сайт вымышленной клиники, чтобы показать виджет в работе
const services = [
  { name: "Консультация", price: "5 000 ֏" },
  { name: "Профессиональная чистка", price: "15 000 ֏" },
  { name: "Пломба", price: "от 20 000 ֏" },
  { name: "Отбеливание", price: "от 60 000 ֏" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-800">
      <header className="border-b border-slate-100">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="text-lg font-bold text-teal-700">🦷 Smile Demo Clinic</div>
          <div className="text-sm text-slate-500">Пн–Сб 10:00–20:00</div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <p className="mb-3 inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">Демо AI чат-виджета</p>
        <h1 className="max-w-2xl text-4xl font-bold leading-tight">Ответы пациентам и запись на приём — 24/7, прямо на сайте</h1>
        <p className="mt-4 max-w-xl text-slate-600">
          Нажмите на кнопку 💬 справа внизу и спросите о ценах, графике или запишитесь. Ассистент отвечает сразу, а заявка уходит администратору.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-24">
        <h2 className="mb-4 text-xl font-semibold">Услуги и цены</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map(s => (
            <div key={s.name} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
              <span>{s.name}</span>
              <span className="font-semibold text-teal-700">{s.price}</span>
            </div>
          ))}
        </div>
      </section>

      <ChatWidget
        businessName="Smile Demo Clinic"
        greeting="Здравствуйте! 👋 Я AI-ассистент клиники. Чем могу помочь?"
        quickReplies={["Сколько стоит чистка?", "Хочу записаться", "Часы работы"]}
      />
    </main>
  );
}
