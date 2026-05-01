import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { holdingId, currentPrice } = body

    if (!holdingId || !currentPrice) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const holding = await prisma.holding.update({
      where: { id: holdingId },
      data: { currentPrice: parseFloat(currentPrice) },
    })

    return NextResponse.json({ success: true, data: holding })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update price' }, { status: 500 })
  }
}