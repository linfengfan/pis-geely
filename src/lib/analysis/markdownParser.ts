/**
 * Markdown 年报解析器
 * 从用户上传的 .md 年报文件中提取财务数据
 */

export interface FinancialTable {
  year: number
  revenue?: number         // 营业收入
  netProfit?: number       // 净利润
  totalAssets?: number    // 总资产
  totalLiabilities?: number // 总负债
  equity?: number          // 所有者权益
  operatingCashFlow?: number // 经营现金流
  investingCashFlow?: number // 投资现金流
  financingCashFlow?: number // 融资现金流
  grossMargin?: number     // 毛利率
  netMargin?: number       // 净利率
  roe?: number             // 净资产收益率
  roic?: number            // 投资资本回报率
  debtRatio?: number       // 资产负债率
  dividendYield?: number   // 股息率
  eps?: number             // 每股收益
  ebitda?: number          // EBITDA
}

export interface ParsedReport {
  companyName?: string
  tables: FinancialTable[]
  rawText: string
}

// 财务指标关键词映射
const KEYWORD_MAP: Record<string, keyof FinancialTable> = {
  '营业收入': 'revenue',
  '营业总收入': 'revenue',
  '净利润': 'netProfit',
  '归属净利润': 'netProfit',
  '总资产': 'totalAssets',
  '总负债': 'totalLiabilities',
  '资产负债率': 'debtRatio',
  '所有者权益': 'equity',
  '净资产': 'equity',
  '经营现金流': 'operatingCashFlow',
  '经营活动现金流': 'operatingCashFlow',
  '投资现金流': 'investingCashFlow',
  '投资活动现金流': 'investingCashFlow',
  '融资现金流': 'financingCashFlow',
  '筹资活动现金流': 'financingCashFlow',
  '毛利率': 'grossMargin',
  '净利率': 'netMargin',
  '净资产收益率': 'roe',
  'ROE': 'roe',
  '投资资本回报率': 'roic',
  'ROIC': 'roic',
  '股息率': 'dividendYield',
  '每股收益': 'eps',
  'EPS': 'eps',
  'EBITDA': 'ebitda',
}

// 年份正则
const YEAR_PATTERN = /(20\d{2})/g

/**
 * 解析 Markdown 年报文件
 */
export function parseMarkdownReport(markdown: string): ParsedReport {
  const tables = extractTables(markdown)
  const companyName = extractCompanyName(markdown)

  const financialData: FinancialTable[] = []

  for (const table of tables) {
    const data = parseFinancialTable(table)
    if (data) {
      financialData.push(data)
    }
  }

  // 如果没有找到表格，尝试从文本中提取
  if (financialData.length === 0) {
    const extracted = extractFromText(markdown)
    financialData.push(...extracted)
  }

  return {
    companyName,
    tables: financialData,
    rawText: markdown,
  }
}

/**
 * 从文本中提取公司名称
 */
function extractCompanyName(markdown: string): string | undefined {
  // 尝试匹配 "公司名称：XXX" 或 "# XXX"
  const patterns = [
    /公司名称[：:]\s*(.+)/,
    /^#\s+(.+?公司)/m,
    /^(.+?股份有限公司)/m,
    /^(.+?有限公司)/m,
  ]

  for (const pattern of patterns) {
    const match = markdown.match(pattern)
    if (match) {
      return match[1].trim()
    }
  }

  return undefined
}

/**
 * 提取 Markdown 中的所有表格
 */
function extractTables(markdown: string): string[][][] {
  const tables: string[][][] = []
  const tableBlocks = markdown.match(/\|[\s\S]+?(?=\n\n|$)/g) || []

  for (const block of tableBlocks) {
    const lines = block.trim().split('\n').filter(line => line.startsWith('|'))
    if (lines.length >= 2) {
      const table: string[][] = []
      for (const line of lines) {
        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell !== '')
        table.push(cells)
      }
      if (isFinancialTable(table)) {
        tables.push(table)
      }
    }
  }

  return tables
}

/**
 * 判断是否为财务数据表格
 */
function isFinancialTable(table: string[][]): boolean {
  if (table.length < 2) return false

  // 检查表头是否包含财务关键词
  const header = table[0].join(' ')
  const keywords = Object.keys(KEYWORD_MAP)

  return keywords.some(keyword => header.includes(keyword))
}

/**
 * 解析单个财务表格
 */
function parseFinancialTable(table: string[][]): FinancialTable | null {
  if (table.length < 2) return null

  const header = table[0]
  const years: number[] = []

  // 提取年份
  for (const cell of header) {
    const matches = cell.match(YEAR_PATTERN)
    if (matches) {
      years.push(parseInt(matches[0]))
    }
  }

  if (years.length === 0) return null

  const data: FinancialTable = {
    year: years[0],
  }

  // 解析每个指标
  for (let i = 1; i < table.length; i++) {
    const row = table[i]
    if (row.length < 2) continue

    const label = row[0].trim()
    const field = KEYWORD_MAP[label]

    if (field && years.length > 0) {
      // 找到对应年份的值
      const valueIdx = years.length > 1 ? years.indexOf(data.year) + 1 : 1
      if (valueIdx < row.length) {
        const rawValue = row[valueIdx].replace(/[,，%]/g, '').trim()
        const value = parseFloat(rawValue)

        if (!isNaN(value)) {
          // 处理百分比
          if (row[valueIdx].includes('%')) {
            (data as Record<string, number | undefined>)[field] = value
          } else {
            // 单位转换：如果是亿/万
            if (row[valueIdx].includes('亿')) {
              (data as Record<string, number | undefined>)[field] = value * 100000000
            } else if (row[valueIdx].includes('万')) {
              (data as Record<string, number | undefined>)[field] = value * 10000
            } else {
              (data as Record<string, number | undefined>)[field] = value
            }
          }
        }
      }
    }
  }

  return data.year ? data : null
}

/**
 * 从文本中提取财务数据（当表格解析失败时）
 */
function extractFromText(markdown: string): FinancialTable[] {
  const results: FinancialTable[] = []

  // 匹配 "指标: XXX" 格式
  for (const [keyword, field] of Object.entries(KEYWORD_MAP)) {
    const pattern = new RegExp(`${keyword}[：:]\\s*([\\d.,]+)`)
    const match = markdown.match(pattern)

    if (match) {
      const yearMatch = markdown.match(YEAR_PATTERN)
      const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear()

      let value = parseFloat(match[1].replace(/[,，]/g, ''))

      // 单位转换
      if (markdown.includes('亿元')) value *= 100000000
      if (markdown.includes('万元')) value *= 10000

      const existing = results.find(r => r.year === year)
      if (existing) {
        (existing as Record<string, number | undefined>)[field] = value
      } else {
        results.push({ year, [field]: value })
      }
    }
  }

  return results
}

/**
 * 验证解析结果的完整性
 */
export function validateParsedData(data: FinancialTable[]): {
  valid: boolean
  missingFields: string[]
  completeness: number
} {
  if (data.length === 0) {
    return { valid: false, missingFields: ['year', 'revenue', 'netProfit'], completeness: 0 }
  }

  const latestYear = data[data.length - 1]
  const requiredFields: (keyof FinancialTable)[] = [
    'revenue',
    'netProfit',
    'totalAssets',
    'equity',
    'operatingCashFlow',
    'grossMargin',
    'roe',
  ]

  const missingFields = requiredFields.filter(field => !latestYear[field])

  const filledCount = requiredFields.filter(field => latestYear[field]).length
  const completeness = Math.round((filledCount / requiredFields.length) * 100)

  return {
    valid: completeness >= 50,
    missingFields,
    completeness,
  }
}

/**
 * 导出为标准格式
 */
export function exportToStandardFormat(data: FinancialTable[]): Record<string, number> {
  const result: Record<string, number> = {}

  for (const entry of data) {
    for (const [key, value] of Object.entries(entry)) {
      if (value !== undefined) {
        result[key] = value
      }
    }
  }

  return result
}