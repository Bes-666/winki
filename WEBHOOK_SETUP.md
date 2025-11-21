# 🚀 Быстрая настройка Telegram Webhook

## Проблема: Бот не отвечает

Если вы добавили токен в Netlify, но бот не отвечает, значит нужно настроить **webhook**.

## 📋 Что нужно:

1. **Telegram Bot Token** (уже есть в Netlify)
2. **URL вашего сайта на Netlify** (например: `https://winki-123.netlify.app`)

## 🔧 Способ 1: Через браузер (Самый простой)

### Шаг 1: Найдите URL вашего сайта
1. Зайдите в [Netlify Dashboard](https://app.netlify.com)
2. Откройте ваш проект "winki"
3. Скопируйте URL сайта (например: `https://winki-123.netlify.app`)

### Шаг 2: Получите токен бота
1. В Netlify Dashboard → Project configuration → Environment variables
2. Найдите `TELEGRAM_BOT_TOKEN`
3. Нажмите на значок глаза, чтобы увидеть токен (или скопируйте из "Local development")

### Шаг 3: Настройте webhook
Откройте в браузере следующую ссылку, заменив:
- `YOUR_BOT_TOKEN` на ваш токен
- `YOUR_NETLIFY_URL` на URL вашего сайта

```
https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://YOUR_NETLIFY_URL/api/webhook
```

**Пример:**
```
https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://your-site.netlify.app/api/webhook
```

### Шаг 4: Проверьте webhook
Откройте в браузере:
```
https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo
```

Должно показать:
```json
{
  "ok": true,
  "result": {
    "url": "https://your-site.netlify.app/api/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

## 🔧 Способ 2: Через скрипт

Запустите скрипт:
```bash
./setup-webhook-simple.sh
```

Скрипт попросит ввести токен и URL, затем автоматически настроит webhook.

## 🔧 Способ 3: Через curl (в терминале)

```bash
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
  -d "url=https://YOUR_NETLIFY_URL/api/webhook"
```

## ✅ Проверка

После настройки webhook:
1. Откройте Telegram
2. Найдите вашего бота
3. Отправьте команду `/start`
4. Бот должен ответить приветственным сообщением

## 🐛 Если не работает:

1. **Проверьте токен:**
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getMe
   ```
   Должен вернуть информацию о боте

2. **Проверьте URL webhook:**
   - URL должен быть доступен (откройте в браузере)
   - Должен быть HTTPS (не HTTP)
   - Должен заканчиваться на `/api/webhook`

3. **Проверьте логи Netlify:**
   - Site settings → Functions → Logs
   - Ищите ошибки при вызове `/api/webhook`

4. **Убедитесь, что сайт задеплоен:**
   - Проверьте, что последний деплой успешен
   - URL должен быть активным

## 📝 Важно:

- Webhook нужно настроить **один раз** после деплоя
- Если вы меняете URL сайта, нужно перенастроить webhook
- Если бот перестал отвечать, проверьте webhook через `getWebhookInfo`

