# 🔧 Исправление проблемы с неправильным ботом

## Проблема: Webhook настроен на другого бота ("YourBot")

Если при переходе по ссылке вы попадаете на другого бота, значит используется неправильный токен.

## ✅ Решение:

### Шаг 1: Проверьте, какой бот соответствует токену в Netlify

1. Зайдите в Netlify Dashboard
2. Откройте проект "winki"
3. Перейдите в **Project configuration** → **Environment variables**
4. Найдите `TELEGRAM_BOT_TOKEN`
5. Скопируйте токен (нажмите на значок глаза)

6. Откройте в браузере (замените `YOUR_BOT_TOKEN` на скопированный токен):
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
    "first_name": "Название бота",
    "username": "bot_username"
  }
}
```

**Проверьте:**
- Если `first_name` = "YourBot" или другое неправильное имя → токен неправильный
- Если `username` не соответствует вашему боту → токен неправильный

### Шаг 2: Создайте правильного бота (если нужно)

1. Откройте Telegram
2. Найдите **@BotFather**
3. Отправьте `/newbot`
4. Следуйте инструкциям:
   - Введите название бота (например: "SkillStock Bot")
   - Введите username бота (например: "skillstock_bot" - должен заканчиваться на `_bot`)
5. **Скопируйте токен**, который даст BotFather

### Шаг 3: Обновите токен в Netlify

1. В Netlify Dashboard → **Environment variables**
2. Найдите `TELEGRAM_BOT_TOKEN`
3. Нажмите **Edit** (или **Options** → **Edit**)
4. Вставьте **новый токен** от правильного бота
5. **Важно:** Обновите для всех контекстов:
   - ✅ Production
   - ✅ Deploy Previews
   - ✅ Branch deploys
   - ✅ Preview Server & Agent Runners
   - ✅ Local development
6. Сохраните изменения

### Шаг 4: Переустановите webhook

После обновления токена нужно переустановить webhook:

1. Получите URL вашего сайта на Netlify (например: `https://winki-123.netlify.app`)

2. Откройте в браузере (замените `НОВЫЙ_ТОКЕН` и `YOUR_NETLIFY_URL`):
```
https://api.telegram.org/botНОВЫЙ_ТОКЕН/setWebhook?url=https://YOUR_NETLIFY_URL/api/webhook
```

3. Проверьте webhook:
```
https://api.telegram.org/botНОВЫЙ_ТОКЕН/getWebhookInfo
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

### Шаг 5: Проверьте бота

1. Найдите вашего бота в Telegram по username (например, @skillstock_bot)
2. Отправьте команду `/start`
3. Бот должен ответить приветственным сообщением от SkillStock

## 🐛 Если все еще не работает:

1. **Убедитесь, что используете правильный username бота** (не "YourBot")
2. **Проверьте, что токен обновлен во всех контекстах** в Netlify
3. **Подождите 1-2 минуты** после обновления токена (Netlify нужно время для применения изменений)
4. **Проверьте логи Netlify** (Functions → Logs) на наличие ошибок
5. **Попробуйте удалить и заново установить webhook:**
   ```
   https://api.telegram.org/botТОКЕН/deleteWebhook
   ```
   Затем:
   ```
   https://api.telegram.org/botТОКЕН/setWebhook?url=https://YOUR_NETLIFY_URL/api/webhook
   ```

## 📝 Важно:

- Один токен = один бот
- Если токен от "YourBot", то webhook будет работать только с "YourBot"
- Нужно использовать токен от **вашего** бота (который вы создали через @BotFather)

