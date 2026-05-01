import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        financialData: {
          orderBy: { year: 'desc' },
          take: 1,
        },
        analysis: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
    })

    // 添加计算字段
    const pool = companies.map(company => {
      const latestFinancial = company.financialData[0]
      const latestAnalysis = company.analysis[0]

      return {
        id: company.id,
        name: company.name,
        code: company.code,
        industry: company.industry,
        companyType: company.companyType,
        // 最新财务数据
        latestYear: latestFinancial?.year,
        revenue: latestFinancial?.revenue,
        netProfit: latestFinancial?.netProfit,
        roe: latestFinancial?.roe,
        grossMargin: latestFinancial?.grossMargin,
        debtRatio: latestFinancial?.debtRatio,
        // 最新分析结果
        latestConclusion: latestAnalysis?.conclusion,
        latestMarginOfSafety: latestAnalysis?.marginOfSafety,
        latestModel: latestAnalysis?.modelUsed,
        latestAnalysisDate: latestAnalysis?.createdAt,
      }
    })

    return NextResponse.json({ success: true, data: pool })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch pool' }, { status: 500 })
  }
}