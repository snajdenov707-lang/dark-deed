# ☕ Тёмное дело — Telegram Mini App для кофейни

Написал мини-приложение, которое живёт прямо внутри Telegram: гость открывает его через синюю кнопку у бота, выбирает напиток, кастомизирует и оформляет заказ. Без установок, без регистраций — я использую сам факт того, что человек уже сидит в мессенджере.

Делал как учебно-коммерческий проект под конкретную кофейню — хотел собрать полный full-stack сам: фронт, база, авторизация, серверные функции, пуш-уведомления.

---

## ✨ Что я реализовал

- **Меню кофейни** — 14 позиций (эспрессо, альтернатива, десерты), фильтр по категориям, поиск, подсказки на пустом экране
- **Карточка товара** — выбор объёма (250/350/450 мл), молока (обычное/овсяное/миндальное/безлактозное), доп. шоты эспрессо. Цена пересчитывается на лету пока крутишь опции
- **Корзина** — добавление, +/−, удаление, промокоды с валидацией через БД
- **Оформление заказа** — способ (самовывоз / за столик по QR), время, оплата (СБП / карта / бонусы), комментарий бариста
- **Real-time статус** — юзер видит, как заказ проходит стадии *Принят → Готовим → Готов → Выдан*, без ручного обновления. Сделал через Supabase Realtime по WebSocket
- **История заказов** — все прошлые заказы юзера с детализацией. Прикрутил кнопку «Повторить заказ» — одним тапом весь состав возвращается в корзину, с теми же опциями
- **Избранное** — сердечко на карточке товара, отдельная страница
- **Профиль** — тянет аватар и имя из Telegram, показывает мою tier-систему (Гость → Bronze → Silver → Gold, порог по количеству заказов), баланс бонусов, любимую категорию, потрачено всего
- **Промокоды** — валидирую в БД (тестовые: `DARK15` = −15%, `WELCOME50` = −50 ₽)
- **Бонусы** — 3.5% от суммы автоматически на счёт после оплаты
- **Нативные Telegram-фичи** — BackButton (не свою в шапке, а системную), HapticFeedback на кнопках, авто-подгонка под тёмную/светлую тему клиента, учёт safe-area (Dynamic Island, notch)

---

## 🛠 Стек и почему я его выбрал

**Frontend:**
- **Next.js 16 (App Router) + React 19 + TypeScript** — выбрал потому, что уже работал с ним, App Router даёт нормальный роутинг, code-splitting из коробки, типы ловят большинство ошибок ещё в редакторе
- **Tailwind CSS v4** — не хотел писать 20 CSS-модулей ради простых страниц, tailwind позволил держать стили рядом с разметкой
- **Zustand + persist/localStorage** — для корзины и избранного. Redux сюда — оверкилл, а мне нужен был просто store с автосохранением: закрыл приложение → открыл → корзина на месте
- **TanStack Query** — кэширую серверные данные, чтобы меню не грузилось при каждом переходе; заодно бесплатно получил refetch и invalidation
- **@twa-dev/sdk** — обёртка над Telegram Web App API

**Backend:**
- **Supabase Postgres 17** — взял Postgres потому что RLS-политики. Мне нужно было гарантировать, что юзер физически не сможет прочитать чужой заказ — RLS решает это на уровне БД, а не на уровне клиента (клиенту доверять нельзя)
- **Supabase Auth** — не стал делать email/пароль. Раз человек уже в Telegram, HMAC-подписи `initData` хватает. Написал свою edge-функцию, которая принимает подпись, проверяет её и выдаёт настоящую Supabase-сессию
- **Supabase Edge Functions (Deno):**
  - `tg-auth` — проверяет HMAC-SHA256 подпись Telegram, апсертит юзера, отдаёт клиенту access/refresh токены
  - `notify-order` — вызывает Bot API `sendMessage`, шлёт пуши юзеру и бариста
- **pg_net** — расширение Postgres для асинхронного HTTP. Использую в триггерах на `orders`, чтобы при новом заказе тут же дёргать edge-функцию

**Инфраструктура:**
- **Vercel** — хостинг фронта, автодеплой из `main` при каждом push (~30 секунд от коммита до прода)
- **GitHub** — репозиторий + теги-чекпойнты (если что-то ломаю, откатываюсь одной командой на предыдущий тег)

---

## 🚀 Как запустить локально

### Требования
- **Node.js 20+** ([скачать](https://nodejs.org/))
- Аккаунт **Supabase** ([регистрация](https://supabase.com/dashboard))
- Аккаунт **Telegram** и созданный бот через [@BotFather](https://t.me/BotFather)

### Шаги

```bash
# 1. Клонировать репозиторий
git clone https://github.com/snajdenov707-lang/dark-deed.git
cd dark-deed

# 2. Установить зависимости
npm install

# 3. Скопировать переменные окружения
cp .env.example .env.local
# ↳ открой .env.local и заполни своими значениями:
#   - TELEGRAM_BOT_TOKEN (у @BotFather после /newbot)
#   - NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
#     (Supabase Dashboard → Settings → API)

# 4. Применить миграции БД
#    (SQL-скрипты в supabase/migrations/, либо через MCP)
#    Создаст таблицы menu_items, orders, order_items, promo_codes,
#    app_settings + RLS-политики + сид с 14 позициями меню

# 5. Задеплоить edge functions (нужен Supabase CLI)
supabase functions deploy tg-auth
supabase functions deploy notify-order
# И добавь секрет: Supabase Dashboard → Functions → tg-auth → Secrets → TELEGRAM_BOT_TOKEN

# 6. Запустить дев-сервер
npm run dev
# Открой http://localhost:3000
# Для теста вне Telegram — открой http://localhost:3000/?dev=1
# (флаг ?dev=1 пропускает Telegram-авторизацию)
```

### Подключение к боту в Telegram

После деплоя на Vercel:
1. Открой [@BotFather](https://t.me/BotFather)
2. `/mybots` → выбери своего бота → **Bot Settings** → **Menu Button** → **Configure menu button**
3. Вставь URL вида `https://your-project.vercel.app`
4. Текст кнопки: `Открыть меню`
5. Открой чат с ботом → внизу появится синяя кнопка «Открыть меню» → тап

---

## 📂 Структура проекта

```
dark-deed/
├── app/                       # Next.js App Router — страницы
│   ├── page.tsx               # Splash-экран
│   ├── layout.tsx             # Корневой layout + провайдеры
│   ├── globals.css            # Токены дизайна и утилиты
│   ├── main/                  # Главная — меню, промо, категории
│   ├── product/[id]/          # Карточка товара + кастомизация
│   ├── cart/                  # Корзина + промокоды
│   ├── checkout/              # Оформление заказа
│   ├── order-status/          # Активный заказ + real-time статус
│   ├── orders/                # История заказов
│   ├── orders/[id]/           # Детали заказа + «Повторить»
│   ├── favorites/             # Избранное
│   ├── search/                # Поиск по меню
│   └── profile/               # Профиль + tier + статистика
│
├── components/
│   ├── TelegramBoot.tsx       # Auth: initData → tg-auth → Supabase session
│   ├── BottomNav.tsx          # Плавающая нижняя навигация
│   ├── KraftBackground.tsx    # Крафт-фон (SVG-волокна)
│   ├── ItemIcon.tsx           # SVG-иллюстрации 11 вариантов чашек/десертов
│   └── Toast.tsx              # Уведомления
│
├── lib/
│   ├── supabase-browser.ts    # Singleton Supabase-клиента
│   ├── api.ts                 # React Query хуки: useMenu, useCreateOrder, useUserStats и т.д.
│   ├── menu.ts                # Fallback-меню, если БД недоступна
│   ├── haptic.ts              # Обёртка над TG HapticFeedback
│   └── types.ts               # TypeScript-типы предметной области
│
├── stores/
│   ├── cart-store.ts          # Zustand + localStorage-корзина
│   └── favorites-store.ts     # Zustand-избранное
│
├── providers/
│   └── QueryProvider.tsx      # TanStack Query провайдер
│
├── .env.example               # Шаблон переменных окружения
├── next.config.ts             # Cache-Control: no-store для Telegram WebView
├── vercel.json                # Настройки деплоя Vercel
└── package.json               # Зависимости и скрипты npm
```

---

## 🖼 Скриншоты

<table>
  <tr>
    <td align="center"><img src="docs/screenshots/boot.png"          alt="Загрузка"  width="220"/><br/><sub>Загрузка</sub></td>
    <td align="center"><img src="docs/screenshots/splash.png"        alt="Splash"    width="220"/><br/><sub>Splash</sub></td>
    <td align="center"><img src="docs/screenshots/main.png"          alt="Главная"   width="220"/><br/><sub>Меню и промо</sub></td>
    <td align="center"><img src="docs/screenshots/product.png"       alt="Товар"     width="220"/><br/><sub>Карточка товара</sub></td>
  </tr>
  <tr>
    <td align="center"><img src="docs/screenshots/cart.png"          alt="Корзина"   width="220"/><br/><sub>Корзина + промокод</sub></td>
    <td align="center"><img src="docs/screenshots/checkout.png"      alt="Оплата"    width="220"/><br/><sub>Оформление</sub></td>
    <td align="center" colspan="2"><img src="docs/screenshots/order-status.png" alt="Статус заказа" width="220"/><br/><sub>Статус заказа</sub></td>
  </tr>
</table>

---

## 📌 Что решал по ходу дела

- **Bot-токен не выпускаю на клиент.** HMAC-проверку `initData` вынес в edge-функцию — токен живёт только в секретах Supabase, в бандл не попадает
- **RLS на всех пользовательских таблицах.** Без этого юзер теоретически мог бы через прямой запрос к БД посмотреть чужие заказы. С RLS Postgres просто не отдаст строку, где `user_id != auth.uid()`
- **Real-time статус заказа.** Сначала думал сделать polling каждые 5 секунд, но подписка через Supabase Realtime работает мгновенно и не нагружает БД лишними запросами
- **Автодеплой из `main`.** Настроил Vercel так, чтобы каждый push в main поднимал новую версию. Теги в git ставлю на стабильные состояния — если что-то ломаю, откат одной командой
- **Кэш Telegram WebView.** Столкнулся с тем, что Telegram агрессивно кэширует WebView и юзеры видят старый бандл. Вылечил заголовком `Cache-Control: no-store` в `next.config.ts`
- **Горизонтальный swipe.** Типовой баг Telegram Mini App — палец елозит по экрану и весь UI уезжает вбок. Пофиксил `overflow-x: hidden` на body + `touch-action: pan-y`
- **Safe-area.** На iPhone с Dynamic Island и notch контент лез под системный бар. Прописал padding через `env(safe-area-inset-top)` — сработало
- **`?dev=1` для отладки вне Telegram.** Флаг в URL обходит Telegram-авторизацию и рендерит UI, чтобы можно было тестить в обычном браузере

---

## 👤 Автор

**Найденов Станислав** — студент Университета «Синергия», 3 курс

Telegram: [@_ (@khrustiks42)](https://t.me/)
Email: snajdenov707@gmail.com

---

## 📄 Лицензия

MIT — см. [LICENSE](./LICENSE)
