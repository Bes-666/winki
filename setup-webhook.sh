#!/bin/bash

# Скрипт для настройки Telegram Webhook
# Использование: ./setup-webhook.sh YOUR_BOT_TOKEN YOUR_NETLIFY_URL

BOT_TOKEN=$1
NETLIFY_URL=$2

if [ -z "$BOT_TOKEN" ] || [ -z "$NETLIFY_URL" ]; then
  echo "Использование: ./setup-webhook.sh YOUR_BOT_TOKEN YOUR_NETLIFY_URL"
  echo "Пример: ./setup-webhook.sh 7561238716:AAFa5_Ub7apYpni03jRCna2i7W9PXEVJfco https://winki-123.netlify.app"
  exit 1
fi

WEBHOOK_URL="${NETLIFY_URL}/api/webhook"

echo "Настройка webhook..."
echo "Bot Token: ${BOT_TOKEN:0:20}..."
echo "Webhook URL: $WEBHOOK_URL"
echo ""

# Установка webhook
RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
  -d "url=${WEBHOOK_URL}")

echo "Ответ от Telegram API:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Проверка webhook
echo "Проверка webhook..."
INFO=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo")
echo "$INFO" | jq '.' 2>/dev/null || echo "$INFO"

