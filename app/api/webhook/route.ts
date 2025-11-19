import { NextRequest, NextResponse } from 'next/server';
import { bot } from '@/lib/telegram';
import { supabase } from '@/lib/supabase';
import { addExperience } from '@/lib/game-logic';

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();

    if (update.message) {
      await handleMessage(update.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleMessage(message: any) {
  const chatId = message.chat.id;
  const text = message.text || '';
  const userId = message.from.id;
  const username = message.from.username;
  const firstName = message.from.first_name;

  // Регистрация пользователя
  let user;
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', userId)
    .single();

  if (!existingUser) {
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        telegram_id: userId,
        username: username,
        first_name: firstName,
        balance: 1000,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return;
    }
    user = newUser;
  } else {
    user = existingUser;
  }

  // Обработка команд
  if (text.startsWith('/start')) {
    await bot.sendMessage(chatId, `
🎮 Добро пожаловать в SkillStock!

📈 Инвестируйте в навыки друзей и зарабатывайте!

Команды:
/skills - Мои навыки
/addskill <название> - Добавить навык
/portfolio - Мой портфель
/market - Рынок навыков
/leaderboard - Рейтинг
/help - Помощь
    `);
  } else if (text.startsWith('/skills')) {
    await showSkills(chatId, user.id);
  } else if (text.startsWith('/addskill')) {
    const skillName = text.replace('/addskill', '').trim();
    if (skillName) {
      await addSkill(chatId, user.id, skillName);
    }
  } else if (text.startsWith('/portfolio')) {
    await showPortfolio(chatId, user.id);
  } else if (text.startsWith('/market')) {
    await showMarket(chatId);
  } else if (text.startsWith('/leaderboard')) {
    await showLeaderboard(chatId);
  }
}

async function showSkills(chatId: number, userId: string) {
  const { data: skills } = await supabase
    .from('skills')
    .select('*')
    .eq('user_id', userId);

  if (!skills || skills.length === 0) {
    await bot.sendMessage(chatId, 'У вас пока нет навыков. Используйте /addskill <название>');
    return;
  }

  let message = '📚 Ваши навыки:\n\n';
  for (const skill of skills) {
    const { data: stock } = await supabase
      .from('stocks')
      .select('current_price')
      .eq('skill_id', skill.id)
      .single();

    message += `🎯 ${skill.name}\n`;
    message += `   Уровень: ${skill.level}\n`;
    message += `   Опыт: ${skill.experience}\n`;
    if (stock?.current_price) {
      message += `   Цена акции: $${stock.current_price.toFixed(2)} 💰\n`;
    }
    message += '\n';
  }

  await bot.sendMessage(chatId, message);
}

async function addSkill(chatId: number, userId: string, skillName: string) {
  const { data: skill } = await supabase
    .from('skills')
    .insert({
      user_id: userId,
      name: skillName,
      level: 1,
      experience: 0,
    })
    .select()
    .single();

  if (skill) {
    await supabase.from('stocks').insert({
      skill_id: skill.id,
      current_price: 10,
      previous_price: 10,
      total_shares: 1000,
    });

    await bot.sendMessage(chatId, `✅ Навык "${skillName}" добавлен! Теперь друзья могут инвестировать в ваш прогресс!`);
  }
}

async function showPortfolio(chatId: number, userId: string) {
  const { data: user } = await supabase
    .from('users')
    .select('balance')
    .eq('id', userId)
    .single();

  if (!user) return;

  const { data: portfolio } = await supabase
    .from('portfolios')
    .select(`
      *,
      stocks (
        current_price
      ),
      skills (
        name,
        users!skills_user_id_fkey (
          username
        )
      )
    `)
    .eq('investor_id', userId);

  if (!portfolio || portfolio.length === 0) {
    await bot.sendMessage(chatId, `💼 Ваш портфель пуст.\n💰 Баланс: $${user.balance.toFixed(2)}`);
    return;
  }

  let message = `💼 Ваш портфель:\n💰 Баланс: $${user.balance.toFixed(2)}\n\n`;
  let totalValue = 0;

  for (const item of portfolio) {
    const currentPrice = (item.stocks as any)?.current_price || 0;
    const skillName = (item.skills as any)?.name || 'Unknown';
    const owner = (item.skills as any)?.users?.username || 'Unknown';
    const value = item.shares * currentPrice;
    totalValue += value;

    message += `📈 ${skillName} (@${owner})\n`;
    message += `   Акций: ${item.shares}\n`;
    message += `   Цена: $${currentPrice.toFixed(2)} 💰\n`;
    message += `   Стоимость: $${value.toFixed(2)} 💰\n\n`;
  }

  message += `📊 Общая стоимость: $${totalValue.toFixed(2)} 💰`;
  await bot.sendMessage(chatId, message);
}

async function showMarket(chatId: number) {
  const { data: stocks } = await supabase
    .from('stocks')
    .select(`
      *,
      skills!inner (
        name,
        users!skills_user_id_fkey (
          username
        )
      )
    `)
    .order('current_price', { ascending: false })
    .limit(10);

  if (!stocks || stocks.length === 0) {
    await bot.sendMessage(chatId, 'Рынок пуст.');
    return;
  }

  let message = '📈 Топ навыков на рынке:\n\n';
  stocks.forEach((stock: any, index) => {
    const skillName = stock.skills?.name || 'Unknown';
    const owner = stock.skills?.users?.username || 'Unknown';
    message += `${index + 1}. ${skillName} (@${owner})\n`;
    message += `   Цена: $${stock.current_price.toFixed(2)} 💰\n\n`;
  });

  await bot.sendMessage(chatId, message);
}

async function showLeaderboard(chatId: number) {
  const { data: users } = await supabase
    .from('users')
    .select('username, balance')
    .order('balance', { ascending: false })
    .limit(10);

  if (!users) return;

  let message = '🏆 Топ инвесторов:\n\n';
  users.forEach((user, index) => {
    message += `${index + 1}. @${user.username || 'Unknown'} - $${user.balance.toFixed(2)} 💰\n`;
  });

  await bot.sendMessage(chatId, message);
}


