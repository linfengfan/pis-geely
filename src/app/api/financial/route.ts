import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { companyId, year, revenue, netProfit, totalAssets, totalLiabilities, equity, operatingCashFlow, investingCashFlow, financingCashFlow, grossMargin, netMargin, roe, roic, debtRatio, dividendYield, eps, ebitda } = body

    const financialData = await prisma.financialData.create({
      data: {
        companyId,
        year,
        revenue,
        netProfit,
        totalAssets,
        totalLiabilities,
        equity,
        operatingCashFlow,
        investingCashFlow,
        financingCashFlow,
        grossMargin,
        netMargin,
        roe,
        roic,
        debtRatio,
        dividendYield,
        eps,
        ebitda,
      },
    })

    return NextResponse.json({ success: true, data: financialData })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create financial data' }, { status: 500 })
  }
}