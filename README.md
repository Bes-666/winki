# SkillStock Bot 🤖📈

Социальная биржа навыков для Telegram с профессиональным веб-интерфейсом в стиле Bybit.

## Установка

1. Клонируйте репозиторий
2. Установите зависимости: `npm install`
3. Создайте `.env` файл с переменными из `.env.example`
4. Настройте Supabase (см. ниже)

## Настройка Supabase

### Создайте таблицы:

См. файл `supabase/schema.sql` для SQL скриптов создания всех таблиц.

## Разработка

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Деплой на Netlify

1. Подключите репозиторий к Netlify
2. Добавьте переменные окружения в Netlify:
   - TELEGRAM_BOT_TOKEN
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
3. Настройте webhook в Telegram Bot API:
   - URL: https://your-app.netlify.app/api/webhook
   - Используйте: `setWebhook` метод

## Структура проекта

- `app/` - Next.js App Router страницы
- `components/` - React компоненты
- `lib/` - Утилиты и конфигурация
- `types/` - TypeScript типы
- `netlify/functions/` - Netlify serverless functions


# winki
