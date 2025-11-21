import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { calculateStockPrice, buyShares, sellShares } from '@/lib/game-logic';

export async function POST(request: NextRequest) {
  try {
    const { userId, skillId, side, orderType, amount, price, stopPrice, takeProfit, stopLoss } = await request.json();

    if (!userId || !skillId || !side || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Получаем информацию о пользователе
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Получаем информацию об акции
    const { data: stock, error: stockError } = await supabaseAdmin
      .from('stocks')
      .select('*, skills!inner(user_id, status)')
      .eq('skill_id', skillId)
      .single();

    if (stockError || !stock) {
      return NextResponse.json(
        { error: 'Stock not found' },
        { status: 404 }
      );
    }

    // Проверяем, что навык одобрен
    if (stock.skills.status !== 'approved') {
      return NextResponse.json(
        { error: 'Skill is not approved for trading' },
        { status: 400 }
      );
    }

    const shares = parseFloat(amount);
    const tradePrice = orderType === 'market' ? stock.current_price : parseFloat(price || '0');
    const totalCost = shares * tradePrice;

    if (side === 'buy') {
      // Проверяем баланс
      if (user.balance < totalCost) {
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        );
      }

      // Проверяем доступность акций
      if (shares > stock.available_shares) {
        return NextResponse.json(
          { error: 'Not enough shares available' },
          { status: 400 }
        );
      }

      // Выполняем покупку через game-logic
      const buyResult = await buyShares(userId, skillId, shares);

      if (!buyResult.success) {
        return NextResponse.json(
          { error: buyResult.error || 'Failed to execute buy order' },
          { status: 400 }
        );
      }

      // Обновляем цену акции
      const newPrice = await calculateStockPrice(skillId);
      await supabaseAdmin
        .from('stocks')
        .update({ 
          current_price: newPrice,
          previous_price: stock.current_price,
        })
        .eq('skill_id', skillId);

      return NextResponse.json({
        success: true,
        message: 'Buy order executed successfully',
        transaction: {
          type: 'buy',
          shares,
          price: tradePrice,
          total: totalCost,
        },
      });
    } else {
      // Продажа
      // Проверяем, есть ли у пользователя акции
      const { data: portfolio, error: portfolioError } = await supabaseAdmin
        .from('portfolios')
        .select('shares')
        .eq('investor_id', userId)
        .eq('skill_id', skillId)
        .single();

      if (portfolioError || !portfolio || portfolio.shares < shares) {
        return NextResponse.json(
          { error: 'Not enough shares to sell' },
          { status: 400 }
        );
      }

      // Выполняем продажу через game-logic
      const sellResult = await sellShares(userId, skillId, shares);

      if (!sellResult.success) {
        return NextResponse.json(
          { error: sellResult.error || 'Failed to execute sell order' },
          { status: 400 }
        );
      }

      // Обновляем цену акции
      const newPrice = await calculateStockPrice(skillId);
      await supabaseAdmin
        .from('stocks')
        .update({ 
          current_price: newPrice,
          previous_price: stock.current_price,
        })
        .eq('skill_id', skillId);

      return NextResponse.json({
        success: true,
        message: 'Sell order executed successfully',
        transaction: {
          type: 'sell',
          shares,
          price: tradePrice,
          total: totalCost,
        },
      });
    }
  } catch (error) {
    console.error('Trade error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

