import { supabase } from './supabase';
import type { Skill, Stock, Transaction, Portfolio } from '@/types';

// Расчет цены акции на основе уровня навыка
export function calculateStockPriceFromLevel(level: number, experience: number): number {
  const basePrice = 10;
  const levelMultiplier = level * 2;
  const experienceBonus = Math.floor(experience / 100);
  return basePrice + levelMultiplier + experienceBonus;
}

// Расчет цены акции по skillId (для API)
export async function calculateStockPrice(skillId: string): Promise<number> {
  const { data: skill, error } = await supabase
    .from('skills')
    .select('level, experience')
    .eq('id', skillId)
    .single();

  if (error || !skill) {
    return 10; // Базовая цена по умолчанию
  }

  return calculateStockPriceFromLevel(skill.level, skill.experience);
}

// Обновление цен всех акций
export async function updateStockPrices() {
  const { data: skills, error } = await supabase
    .from('skills')
    .select('id, level, experience, status')
    .eq('status', 'approved');

  if (error || !skills) {
    console.error('Error fetching skills:', error);
    return;
  }

  for (const skill of skills) {
    const newPrice = calculateStockPriceFromLevel(skill.level, skill.experience);
    
    // Получаем текущую цену
    const { data: stock } = await supabase
      .from('stocks')
      .select('current_price')
      .eq('skill_id', skill.id)
      .single();

    const previousPrice = stock?.current_price || newPrice;

    // Обновляем или создаем акцию
    await supabase
      .from('stocks')
      .upsert({
        skill_id: skill.id,
        current_price: newPrice,
        previous_price: previousPrice,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'skill_id'
      });
  }
}

// Добавление опыта к навыку
export async function addExperience(skillId: string, amount: number): Promise<boolean> {
  const { data: skill, error: fetchError } = await supabase
    .from('skills')
    .select('level, experience')
    .eq('id', skillId)
    .single();

  if (fetchError || !skill) {
    console.error('Error fetching skill:', fetchError);
    return false;
  }

  let newExperience = skill.experience + amount;
  let newLevel = skill.level;

  // Проверка на повышение уровня (каждые 1000 опыта = +1 уровень)
  while (newExperience >= newLevel * 1000) {
    newLevel++;
  }

  const { error: updateError } = await supabase
    .from('skills')
    .update({
      experience: newExperience,
      level: newLevel,
      updated_at: new Date().toISOString(),
    })
    .eq('id', skillId);

  if (updateError) {
    console.error('Error updating skill:', updateError);
    return false;
  }

  // Обновляем цену акции (триггер в БД тоже обновит, но для надежности)
  await updateStockPrices();
  
  return true;
}

// Покупка акций
export async function buyShares(
  investorId: string,
  skillId: string,
  shares: number
): Promise<{ success: boolean; error?: string }> {
  // Получаем текущую цену акции
  const { data: stock, error: stockError } = await supabase
    .from('stocks')
    .select('current_price, total_shares')
    .eq('skill_id', skillId)
    .single();

  if (stockError || !stock) {
    return { success: false, error: 'Stock not found' };
  }

  if (shares > stock.total_shares) {
    return { success: false, error: 'Not enough shares available' };
  }

  const price = stock.current_price;
  const total = price * shares;

  // Проверяем баланс инвестора
  const { data: investor, error: investorError } = await supabase
    .from('users')
    .select('balance')
    .eq('id', investorId)
    .single();

  if (investorError || !investor) {
    return { success: false, error: 'Investor not found' };
  }

  if (investor.balance < total) {
    return { success: false, error: 'Insufficient balance' };
  }

  // Начинаем транзакцию
  const { data: existingPortfolio } = await supabase
    .from('portfolios')
    .select('shares, average_price')
    .eq('investor_id', investorId)
    .eq('skill_id', skillId)
    .single();

  let newShares: number;
  let newAveragePrice: number;

  if (existingPortfolio) {
    // Обновляем существующий портфель
    const totalCost = existingPortfolio.shares * existingPortfolio.average_price + total;
    newShares = existingPortfolio.shares + shares;
    newAveragePrice = totalCost / newShares;

    const { error: portfolioError } = await supabase
      .from('portfolios')
      .update({
        shares: newShares,
        average_price: newAveragePrice,
        updated_at: new Date().toISOString(),
      })
      .eq('investor_id', investorId)
      .eq('skill_id', skillId);

    if (portfolioError) {
      return { success: false, error: portfolioError.message };
    }
  } else {
    // Создаем новый портфель
    newShares = shares;
    newAveragePrice = price;

    const { error: portfolioError } = await supabase
      .from('portfolios')
      .insert({
        investor_id: investorId,
        skill_id: skillId,
        shares: newShares,
        average_price: newAveragePrice,
      });

    if (portfolioError) {
      return { success: false, error: portfolioError.message };
    }
  }

  // Обновляем баланс
  const { error: balanceError } = await supabase
    .from('users')
    .update({
      balance: investor.balance - total,
    })
    .eq('id', investorId);

  if (balanceError) {
    return { success: false, error: balanceError.message };
  }

  // Создаем запись о транзакции
  const { error: transactionError } = await supabase
    .from('transactions')
    .insert({
      investor_id: investorId,
      skill_id: skillId,
      type: 'buy',
      shares: shares,
      price: price,
      total: total,
    });

  if (transactionError) {
    return { success: false, error: transactionError.message };
  }

  // Обновляем объем торгов
  await supabase
    .from('stocks')
    .update({
      volume_24h: (stock.total_shares || 0) + total,
    })
    .eq('skill_id', skillId);

  return { success: true };
}

// Продажа акций
export async function sellShares(
  investorId: string,
  skillId: string,
  shares: number
): Promise<{ success: boolean; error?: string }> {
  // Проверяем наличие акций в портфеле
  const { data: portfolio, error: portfolioError } = await supabase
    .from('portfolios')
    .select('shares, average_price')
    .eq('investor_id', investorId)
    .eq('skill_id', skillId)
    .single();

  if (portfolioError || !portfolio) {
    return { success: false, error: 'No shares in portfolio' };
  }

  if (portfolio.shares < shares) {
    return { success: false, error: 'Not enough shares to sell' };
  }

  // Получаем текущую цену
  const { data: stock, error: stockError } = await supabase
    .from('stocks')
    .select('current_price')
    .eq('skill_id', skillId)
    .single();

  if (stockError || !stock) {
    return { success: false, error: 'Stock not found' };
  }

  const price = stock.current_price;
  const total = price * shares;

  // Обновляем портфель
  const newShares = portfolio.shares - shares;

  if (newShares === 0) {
    // Удаляем запись портфеля, если акций не осталось
    await supabase
      .from('portfolios')
      .delete()
      .eq('investor_id', investorId)
      .eq('skill_id', skillId);
  } else {
    await supabase
      .from('portfolios')
      .update({
        shares: newShares,
        updated_at: new Date().toISOString(),
      })
      .eq('investor_id', investorId)
      .eq('skill_id', skillId);
  }

  // Обновляем баланс
  const { data: investor } = await supabase
    .from('users')
    .select('balance')
    .eq('id', investorId)
    .single();

  if (investor) {
    await supabase
      .from('users')
      .update({
        balance: investor.balance + total,
      })
      .eq('id', investorId);
  }

  // Создаем запись о транзакции
  await supabase
    .from('transactions')
    .insert({
      investor_id: investorId,
      skill_id: skillId,
      type: 'sell',
      shares: shares,
      price: price,
      total: total,
    });

  return { success: true };
}

// Расчет прибыли/убытка для портфеля
export function calculateProfitLoss(
  averagePrice: number,
  currentPrice: number,
  shares: number
): { profit: number; profitPercent: number } {
  const profit = (currentPrice - averagePrice) * shares;
  const profitPercent = ((currentPrice - averagePrice) / averagePrice) * 100;
  return { profit, profitPercent };
}

// Получение статистики портфеля
export async function getPortfolioStats(investorId: string) {
  const { data: portfolios, error } = await supabase
    .from('portfolios')
    .select(`
      *,
      stocks (
        current_price
      )
    `)
    .eq('investor_id', investorId);

  if (error || !portfolios) {
    return { 
      totalValue: 0, 
      totalCost: 0,
      totalProfit: 0, 
      totalProfitPercent: 0,
      items: [] 
    };
  }

  let totalValue = 0;
  let totalCost = 0;

  const items = portfolios.map((portfolio: any) => {
    const currentPrice = portfolio.stocks?.current_price || 0;
    const value = currentPrice * portfolio.shares;
    const cost = portfolio.average_price * portfolio.shares;
    const profit = value - cost;
    const profitPercent = ((currentPrice - portfolio.average_price) / portfolio.average_price) * 100;

    totalValue += value;
    totalCost += cost;

    return {
      ...portfolio,
      currentPrice,
      value,
      cost,
      profit,
      profitPercent,
    };
  });

  const totalProfit = totalValue - totalCost;
  const totalProfitPercent = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

  return {
    totalValue,
    totalCost,
    totalProfit,
    totalProfitPercent,
    items,
  };
}


