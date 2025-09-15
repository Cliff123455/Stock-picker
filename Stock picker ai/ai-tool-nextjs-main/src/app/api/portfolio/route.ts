import { NextRequest, NextResponse } from 'next/server';
import { alpacaService } from '@/libs/alpaca';

export async function GET(request: NextRequest) {
  try {
    // Get account information
    const account = await alpacaService.getAccount();
    
    // Get current positions
    const positions = await alpacaService.getPositions();
    
    // Get open orders
    const orders = await alpacaService.getOrders();
    
    // Calculate portfolio metrics
    const totalValue = parseFloat(account.portfolio_value);
    const totalGainLoss = parseFloat(account.unrealized_pl);
    const totalGainLossPercent = (totalGainLoss / (totalValue - totalGainLoss)) * 100;
    
    // Format positions
    const formattedPositions = positions.map((position: any) => ({
      symbol: position.symbol,
      quantity: parseFloat(position.qty),
      averagePrice: parseFloat(position.avg_entry_price),
      currentPrice: parseFloat(position.current_price),
      marketValue: parseFloat(position.market_value),
      gainLoss: parseFloat(position.unrealized_pl),
      gainLossPercent: parseFloat(position.unrealized_plpc) * 100,
      side: parseFloat(position.qty) > 0 ? 'LONG' : 'SHORT'
    }));
    
    // Format orders
    const formattedOrders = orders.map((order: any) => ({
      id: order.id,
      symbol: order.symbol,
      side: order.side,
      type: order.order_type,
      quantity: parseFloat(order.qty),
      status: order.status,
      submittedAt: order.submitted_at,
      filledAt: order.filled_at,
      limitPrice: order.limit_price ? parseFloat(order.limit_price) : null,
      stopPrice: order.stop_price ? parseFloat(order.stop_price) : null
    }));

    const portfolio = {
      id: 'main',
      name: 'Main Portfolio',
      totalValue,
      totalGainLoss,
      totalGainLossPercent,
      positions: formattedPositions,
      orders: formattedOrders,
      account: {
        buyingPower: parseFloat(account.buying_power),
        cash: parseFloat(account.cash),
        equity: parseFloat(account.equity),
        dayTradingBuyingPower: parseFloat(account.daytrading_buying_power),
        patternDayTrader: account.pattern_day_trader,
        portfolioValue: parseFloat(account.portfolio_value),
        status: account.status
      },
      createdAt: account.created_at,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: portfolio,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch portfolio data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, orderId } = body;

    if (action === 'cancel' && orderId) {
      // Cancel an order
      const result = await alpacaService.cancelOrder(orderId);
      return NextResponse.json({
        success: true,
        data: result,
        message: 'Order cancelled successfully'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error processing portfolio action:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process portfolio action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
