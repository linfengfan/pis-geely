import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const portfolios = await prisma.portfolio.findMany({
      include: {
        holdings: {
          include: {
            company: {
              include: {
                analysis: {
                  orderBy: { createdAt: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // 计算每个组合的统计数据
    const result = portfolios.map(portfolio => {
      let totalCost = 0
      let totalValue = 0
      let totalProfit = 0

      const holdings = portfolio.holdings.map(holding => {
        const cost = holding.buyPrice * holding.buyQuantity
        const value = (holding.currentPrice || holding.buyPrice) * holding.buyQuantity
        const profit = value - cost
        const profitRate = cost > 0 ? (profit / cost) * 100 : 0

        totalCost += cost
        totalValue += value
        totalProfit += profit

        return {
          id: holding.id,
          company: {
            id: holding.company.id,
            name: holding.company.name,
            code: holding.company.code,
          },
          buyPrice: holding.buyPrice,
          buyQuantity: holding.buyQuantity,
          currentPrice: holding.currentPrice,
          cost,
          value,
          profit,
          profitRate,
          latestConclusion: holding.company.analysis[0]?.conclusion,
        }
      })

      const totalProfitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0

      return {
        id: portfolio.id,
        name: portfolio.name,
        createdAt: portfolio.createdAt,
        holdings,
        stats: {
          totalCost,
          totalValue,
          totalProfit,
          totalProfitRate,
          holdingCount: holdings.length,
        },
      }
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch portfolios' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name } = body

    const portfolio = await prisma.portfolio.create({
      data: { name },
    })

    return NextResponse.json({ success: true, data: portfolio })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create portfolio' }, { status: 500 })
  }
}