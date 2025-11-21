# 🔍 Отладка Telegram Webhook

## Проблема: Webhook настроен, но бот не отвечает

Если webhook уже настроен (`"ok":true,"result":true`), но бот не отвечает, проверьте следующее:

## ✅ Шаг 1: Проверьте URL webhook

Выполните в браузере:
```
https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo
```

Проверьте, что `url` указывает на правильный адрес:
- Должен быть HTTPS
- Должен заканчиваться на `/api/webhook`
- Должен быть доступен (откройте в браузере)

## ✅ Шаг 2: Проверьте, что endpoint работает

Откройте в браузере:
```
https://YOUR_NETLIFY_URL/api/webhook
```

Должна быть ошибка "Method Not Allowed" (это нормально, т.к. нужен POST).

Если ошибка другая - проверьте деплой.

## ✅ Шаг 3: Проверьте логи Netlify

1. Зайдите в Netlify Dashboard
2. Откройте ваш проект
3. Перейдите в **Functions** → **Logs**
4. Отправьте команду `/start` боту
5. Проверьте логи на наличие ошибок

Ищите:
- `Webhook received:` - значит запрос дошел
- `Processing message from user` - значит обработка началась
- Ошибки с красным текстом

## ✅ Шаг 4: Проверьте переменные окружения

В Netlify Dashboard → Environment variables проверьте:
- ✅ `TELEGRAM_BOT_TOKEN` - должен быть установлен
- ✅ `SUPABASE_URL` - должен быть установлен
- ✅ `SUPABASE_ANON_KEY` - должен быть установлен

## ✅ Шаг 5: Проверьте Supabase

1. Зайдите в Supabase Dashboard
2. Проверьте, что таблицы созданы (users, skills, stocks, etc.)
3. Проверьте, что RLS политики настроены

## ✅ Шаг 6: Тестовая команда

Попробуйте отправить боту:
- `/start` - должно прийти приветствие
- `/help` - должен показать справку

## 🐛 Частые проблемы:

### 1. "Webhook is already set" но бот не отвечает
**Решение:** Проверьте логи Netlify. Скорее всего есть ошибка в коде.

### 2. Ошибка "TELEGRAM_BOT_TOKEN is not set"
**Решение:** Проверьте переменные окружения в Netlify. Убедитесь, что токен добавлен для всех контекстов (Production, Deploy Previews, etc.).

### 3. Ошибка при создании пользователя
**Решение:** Проверьте таблицу `users` в Supabase. Убедитесь, что RLS политики позволяют INSERT.

### 4. Бот отвечает, но с задержкой
**Решение:** Это нормально для serverless функций. Первый запрос может быть медленным (cold start).

## 🔧 Быстрая проверка:

1. Откройте логи Netlify
2. Отправьте `/start` боту
3. Смотрите логи в реальном времени
4. Если видите `Webhook received:` - значит запрос дошел
5. Если видите ошибки - исправляйте их

## 📝 Полезные команды:

Проверить информацию о боте:
```
https://api.telegram.org/botYOUR_BOT_TOKEN/getMe
```

Проверить webhook:
```
https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo
```

Удалить webhook (если нужно переустановить):
```
https://api.telegram.org/botYOUR_BOT_TOKEN/deleteWebhook
```

