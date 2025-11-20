# Настройка системы входа в админ-панель

## Шаг 1: Обновление базы данных

Выполните SQL миграцию в Supabase SQL Editor:

```sql
-- Файл: supabase/admin_auth_migration.sql
```

Эта миграция добавит поля:
- `username` - логин администратора
- `password_hash` - хэш пароля
- `email` - email администратора
- `last_login` - время последнего входа
- `is_active` - активен ли аккаунт

## Шаг 2: Создание первого администратора

### Вариант 1: Через SQL (быстрый способ)

1. Сгенерируйте хэш пароля (используйте Node.js):

```javascript
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('ваш_пароль', 10);
console.log(hash);
```

2. Выполните SQL в Supabase:

```sql
-- Найдите или создайте пользователя с role='admin' в таблице users
-- Затем вставьте запись в admin_users:

INSERT INTO admin_users (
  user_id,
  username,
  email,
  password_hash,
  permissions,
  is_active
) VALUES (
  'USER_ID_ЗДЕСЬ'::uuid,  -- UUID пользователя с role='admin'
  'admin',                 -- Ваш логин
  'admin@example.com',     -- Ваш email
  '$2a$10$ВАШ_ХЭШ_ПАРОЛЯ', -- Хэш пароля из шага 1
  ARRAY['all'],            -- Права доступа
  true
);
```

### Вариант 2: Через скрипт (рекомендуется)

```bash
# Установите зависимости (если еще не установлены)
npm install

# Создайте админ-пользователя
node scripts/create-admin.js <username> <password> <email> <user_id>

# Пример:
node scripts/create-admin.js admin mypassword123 admin@example.com <uuid-пользователя>
```

## Шаг 3: Вход в админ-панель

1. Откройте `/admin` в браузере
2. Введите ваш **логин** и **пароль**
3. Нажмите "Sign In"

## Безопасность

⚠️ **Важно:**
- Используйте сильные пароли
- Не храните пароли в открытом виде
- Регулярно обновляйте пароли администраторов
- В продакшене рассмотрите использование JWT токенов вместо простых base64 токенов

## Управление администраторами

### Добавление нового администратора

1. Убедитесь, что пользователь существует в таблице `users` с `role='admin'`
2. Добавьте запись в `admin_users` с уникальным `username`
3. Установите `password_hash` используя bcrypt

### Деактивация администратора

```sql
UPDATE admin_users 
SET is_active = false 
WHERE username = 'username_here';
```

### Изменение пароля

1. Сгенерируйте новый хэш пароля
2. Обновите запись:

```sql
UPDATE admin_users 
SET password_hash = 'новый_хэш' 
WHERE username = 'username_here';
```

## Структура прав доступа

Права хранятся в массиве `permissions`:
- `['all']` - полный доступ
- `['skills', 'users']` - доступ только к навыкам и пользователям
- `['transactions']` - доступ только к транзакциям

## Troubleshooting

### Ошибка "Invalid credentials"
- Проверьте, что username существует в базе
- Убедитесь, что `is_active = true`
- Проверьте правильность пароля

### Ошибка "Password not set"
- Убедитесь, что `password_hash` установлен в базе данных

### Ошибка "Access denied"
- Проверьте, что связанный пользователь имеет `role='admin'` в таблице `users`

