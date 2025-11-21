# 🔍 Проверка правильного бота

## Проблема: Webhook настроен на неправильного бота

Если бот отвечает, но это не ваш бот (например, "YourBot"), значит используется неправильный токен.

## ✅ Шаг 1: Проверьте, какой бот соответствует токену

Откройте в браузере (замените `YOUR_BOT_TOKEN` на токен из Netlify):
```
https://api.telegram.org/botYOUR_BOT_TOKEN/getMe
```

Это покажет информацию о боте:
```json
{
  "ok": true,
  "result": {
    "id": 123456789,
    "is_bot": true,
    "first_name": "Название вашего бота",
    "username": "your_bot_username"
  }
}
```

**Проверьте:**
- `first_name` - должно быть название вашего бота
- `username` - должно быть имя вашего бота (например, @skillstock_bot)

## ✅ Шаг 2: Проверьте токен в Netlify

1. Зайдите в Netlify Dashboard
2. Откройте проект "winki"
3. Перейдите в **Project configuration** → **Environment variables**
4. Найдите `TELEGRAM_BOT_TOKEN`
5. Проверьте значение токена

## ✅ Шаг 3: Создайте нового бота (если нужно)

Если токен неправильный, создайте нового бота:

1. Откройте Telegram
2. Найдите @BotFather
3. Отправьте `/newbot`
4. Следуйте инструкциям:
   - Введите название бота (например: "SkillStock Bot")
   - Введите username бота (например: "skillstock_bot")
5. Скопируйте токен, который даст BotFather

## ✅ Шаг 4: Обновите токен в Netlify

1. В Netlify Dashboard → Environment variables
2. Найдите `TELEGRAM_BOT_TOKEN`
3. Нажмите "Edit"
4. Вставьте новый токен
5. Сохраните

**Важно:** Обновите токен для всех контекстов:
- Production
- Deploy Previews
- Branch deploys
- Preview Server & Agent Runners
- Local development

## ✅ Шаг 5: Переустановите webhook

После обновления токена переустановите webhook:

1. Получите URL вашего сайта на Netlify
2. Откройте в браузере:
```
https://api.telegram.org/botНОВЫЙ_ТОКЕН/setWebhook?url=https://YOUR_NETLIFY_URL/api/webhook
```

3. Проверьте webhook:
```
https://api.telegram.org/botНОВЫЙ_ТОКЕН/getWebhookInfo
```

## ✅ Шаг 6: Проверьте бота

1. Найдите вашего бота в Telegram (по username, который вы указали)
2. Отправьте `/start`
3. Бот должен ответить приветственным сообщением

## 🐛 Если все еще не работает:

1. Убедитесь, что используете правильный username бота
2. Проверьте, что токен обновлен во всех контекстах в Netlify
3. Подождите 1-2 минуты после обновления токена
4. Попробуйте удалить и заново установить webhook:
   ```
   https://api.telegram.org/botТОКЕН/deleteWebhook
   ```
   Затем:
   ```
   https://api.telegram.org/botТОКЕН/setWebhook?url=https://YOUR_NETLIFY_URL/api/webhook
   ```

