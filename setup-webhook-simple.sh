#!/bin/bash

# Простой скрипт для настройки Telegram Webhook
# Использование: ./setup-webhook-simple.sh

echo "🔧 Настройка Telegram Webhook для SkillStock"
echo ""

# Запрашиваем токен бота
read -p "Введите ваш Telegram Bot Token: " BOT_TOKEN

if [ -z "$BOT_TOKEN" ]; then
  echo "❌ Ошибка: Токен не может быть пустым"
  exit 1
fi

# Запрашиваем URL сайта на Netlify
read -p "Введите URL вашего сайта на Netlify (например: https://winki-123.netlify.app): " NETLIFY_URL

if [ -z "$NETLIFY_URL" ]; then
  echo "❌ Ошибка: URL не может быть пустым"
  exit 1
fi

# Убираем слэш в конце, если есть
NETLIFY_URL="${NETLIFY_URL%/}"

WEBHOOK_URL="${NETLIFY_URL}/api/webhook"

echo ""
echo "📡 Настройка webhook..."
echo "Webhook URL: $WEBHOOK_URL"
echo ""

# Установка webhook
RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
  -d "url=${WEBHOOK_URL}")

echo "Ответ от Telegram API:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

# Проверка webhook
echo "🔍 Проверка webhook..."
INFO=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo")
echo "$INFO" | python3 -m json.tool 2>/dev/null || echo "$INFO"
echo ""

# Проверяем результат
if echo "$RESPONSE" | grep -q '"ok":true'; then
  echo "✅ Webhook успешно настроен!"
  echo ""
  echo "Теперь попробуйте отправить команду /start вашему боту в Telegram"
else
  echo "❌ Ошибка при настройке webhook. Проверьте токен и URL."
fi

