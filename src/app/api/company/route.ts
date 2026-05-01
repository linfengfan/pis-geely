import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ success: true, data: companies })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch companies' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, code, industry, companyType } = body

    const company = await prisma.company.create({
      data: {
        name,
        code,
        industry,
        companyType,
      },
    })

    return NextResponse.json({ success: true, data: company })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create company' }, { status: 500 })
  }
}