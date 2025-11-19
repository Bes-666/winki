# Supabase Setup Instructions

## Создание проекта

1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Скопируйте URL и Anon Key из настроек проекта

## Настройка базы данных

1. Откройте SQL Editor в Supabase Dashboard
2. Скопируйте содержимое файла `schema.sql`
3. Выполните SQL скрипт в SQL Editor

## Переменные окружения

Добавьте в `.env` файл:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Проверка

После выполнения скрипта проверьте, что все таблицы созданы:
- users
- skills
- stocks
- portfolios
- transactions
- achievements
- admin_users


