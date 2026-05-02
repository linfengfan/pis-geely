import { NextResponse } from 'next/server'
import { analyzeWithLLM } from '@/lib/analysis/llmAnalyzer'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()

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

    // 使用 LLM 进行分析
    const result = await analyzeWithLLM({
      markdown: body.markdown,
      companyName: body.companyName,
      code: body.code,
      currentPrice: body.currentPrice,
      macroData: body.macroData,
      sharesOutstanding: body.sharesOutstanding,
      dividendPerShare: body.dividendPerShare,
    })

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    // 保存分析记录到数据库（失败不影响分析结果）
    if (result.data) {
      try {
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
        if (company && result.data.valuation) {
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
              riskScore: result.data.fourDimensions?.liquidity?.score,
              modelUsed: result.data.valuation.recommendedModel,
            },
          })
        }
      } catch (dbError) {
        // 数据库操作失败不影响分析结果，仅记录日志
        console.error('Database save failed (non-fatal):', dbError)
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      {
        success: false,
        error: '分析失败',
        details: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}