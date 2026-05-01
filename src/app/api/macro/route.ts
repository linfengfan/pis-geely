import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const macroData = await prisma.macroSnapshot.findFirst({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data: macroData })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch macro data' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { cn10y, usdcny, lpr, m2, socialFinancing, cpi, pmi } = body

    const macroSnapshot = await prisma.macroSnapshot.create({
      data: {
        cn10y,
        usdcny,
        lpr,
        m2,
        socialFinancing,
        cpi,
        pmi,
      },
    })

    return NextResponse.json({ success: true, data: macroSnapshot })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create macro data' }, { status: 500 })
  }
}