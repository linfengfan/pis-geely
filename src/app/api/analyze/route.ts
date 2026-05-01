import { NextResponse } from 'next/server'
import { analyzeCompany, type AnalysisRequest } from '@/lib/analysis'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body: AnalysisRequest = await request.json()

    // 验证必填参数
    if (!body.markdown) {
      return NextResponse.json(
        { success: false, error: '缺少 markdown 内容' },
        { status: 400 }
      )
    }

    if (!body.macroData) {
      return NextResponse.json(
        { success: false, error: '缺少宏观数据' },
        { status: 400 }
      )
    }

    // 执行分析
    const result = analyzeCompany(body)

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    // 保存分析记录到数据库
    if (result.data) {
      // 查找或创建公司
      let company = body.code
        ? await prisma.company.findFirst({ where: { code: body.code } })
        : null

      if (!company && result.data.companyName) {
        company = await prisma.company.create({
          data: {
            name: result.data.companyName,
            code: body.code || `temp_${Date.now()}`,
          },
        })
      }

      // 创建分析记录
      if (company) {
        await prisma.analysis.create({
          data: {
            companyId: company.id,
            cn10y: body.macroData.cn10y,
            usdcny: body.macroData.usdcny,
            lpr: body.macroData.lpr,
            socialFinancing: body.macroData.socialFinancing,
            conclusion: result.data.valuation.conclusion,
            valuation: result.data.valuation.intrinsicValue,
            intrinsicValue: result.data.valuation.intrinsicValue,
            currentPrice: result.data.valuation.currentPrice,
            marginOfSafety: result.data.valuation.marginOfSafety,
            riskScore: result.data.fourDimensions.liquidity.score,
            modelUsed: result.data.valuation.recommendedModel,
          },
        })
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { success: false, error: '分析失败' },
      { status: 500 }
    )
  }
}