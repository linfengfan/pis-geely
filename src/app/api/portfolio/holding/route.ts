import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { portfolioId, companyId, buyPrice, buyQuantity } = body

    if (!portfolioId || !companyId || !buyPrice || !buyQuantity) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const holding = await prisma.holding.create({
      data: {
        portfolioId,
        companyId,
        buyPrice: parseFloat(buyPrice),
        buyQuantity: parseFloat(buyQuantity),
        currentPrice: parseFloat(buyPrice), // 默认等于买入价
      },
    })

    return NextResponse.json({ success: true, data: holding })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to add holding' }, { status: 500 })
  }
}