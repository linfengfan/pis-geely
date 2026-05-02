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
  // 标准名称
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
  // 带单位标记的名称（亿元/万元）
  '营业收入（亿元）': 'revenue',
  '净利润（亿元）': 'netProfit',
  '总资产（亿元）': 'totalAssets',
  '总负债（亿元）': 'totalLiabilities',
  '所有者权益（亿元）': 'equity',
  '净资产（亿元）': 'equity',
  '经营现金流（亿元）': 'operatingCashFlow',
  '投资现金流（亿元）': 'investingCashFlow',
  '融资现金流（亿元）': 'financingCashFlow',
  '每股收益（元）': 'eps',
  // 带百分号的指标
  'ROE（%）': 'roe',
  '资产负债率（%）': 'debtRatio',
  '毛利率（%）': 'grossMargin',
  '净利率（%）': 'netMargin',
}

/**
 * 从行标签中提取标准关键词
 * 处理带单位标记的情况，如 "营业收入（亿元）" -> "revenue"
 */
function extractKeyword(label: string): string | undefined {
  // 先尝试完整匹配
  if (KEYWORD_MAP[label]) {
    return KEYWORD_MAP[label]  // 返回映射的值，不是原始标签
  }

  // 移除括号及其内容，如 "营业收入（亿元）" -> "营业收入"
  const cleaned = label.replace(/[（(][^）)]*[）)]/g, '').trim()

  if (KEYWORD_MAP[cleaned]) {
    return KEYWORD_MAP[cleaned]
  }

  // 尝试部分匹配（行标签包含关键词）
  for (const [keyword, field] of Object.entries(KEYWORD_MAP)) {
    if (label.includes(keyword)) {
      return field  // 返回映射的值
    }
  }

  return undefined
}

// 年份正则
const YEAR_PATTERN = /(20\d{2})/g

/**
 * 解析 Markdown 年报文件
 */
export function parseMarkdownReport(markdown: string): ParsedReport {
  const tables = extractTables(markdown)
  const companyName = extractCompanyName(markdown)

  // 使用 Map 按年份合并数据
  const yearDataMap = new Map<number, FinancialTable>()

  for (const table of tables) {
    // parseFinancialTable 返回每个年份的记录数组
    const records = parseFinancialTable(table)

    for (const record of records) {
      // 如果该年份已有数据，合并字段
      const existing = yearDataMap.get(record.year)
      if (existing) {
        Object.assign(existing, record)
      } else {
        yearDataMap.set(record.year, record)
      }
    }
  }

  // 如果没有找到表格，尝试从文本中提取
  if (yearDataMap.size === 0) {
    const extracted = extractFromText(markdown)
    for (const record of extracted) {
      const existing = yearDataMap.get(record.year)
      if (existing) {
        Object.assign(existing, record)
      } else {
        yearDataMap.set(record.year, record)
      }
    }
  }

  // 转换为数组并按年份排序（从旧到新）
  const financialData = Array.from(yearDataMap.values()).sort((a, b) => a.year - b.year)

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

  if (keywords.some(keyword => header.includes(keyword))) {
    return true
  }

  // 也检查第一列（行标签）是否包含关键词
  for (let i = 1; i < table.length; i++) {
    const firstCell = table[i][0] || ''
    if (keywords.some(keyword => firstCell.includes(keyword))) {
      return true
    }
  }

  // 检查是否包含年份（用于识别有年份行的表格，如"2025年 | 615.22 | - | -"）
  for (let i = 1; i < table.length; i++) {
    const firstCell = table[i][0] || ''
    if (YEAR_PATTERN.test(firstCell)) {
      // 有年份行且其他列包含财务关键词
      if (table[i].some((cell, idx) => idx > 0 && keywords.some(k => cell.includes(k)))) {
        return true
      }
    }
  }

  return false
}

/**
 * 解析单个财务表格
 * 支持多种格式：
 * 1. 列年份格式：| 指标 | 2025年 | 2024年 | ... | （表头有年份）
 * 2. 行年份格式：| 年度 | 数据1 | 数据2 | ... |
 *                | 2025年 | 615.22 | - | ... | （行内有年份）
 * 返回多个 FinancialTable 条目（每列/每行一个年份）
 */
function parseFinancialTable(table: string[][]): FinancialTable[] {
  if (table.length < 2) return []

  const header = table[0]
  const years: number[] = []
  let isRowYearFormat = false

  // 检查是列年份格式还是行年份格式
  // 如果第一列表头不包含年份，但第一行（跳过表头后的第一行数据）包含年份，则是行年份格式

  // 先尝试列年份格式：从表头查找年份
  for (let i = 1; i < header.length; i++) {
    const cell = header[i]
    const matches = cell.match(YEAR_PATTERN)
    if (matches) {
      years.push(parseInt(matches[0]))
    }
  }

  // 如果没有从表头找到年份，检查是否是行年份格式
  if (years.length === 0 && table.length >= 2) {
    for (let i = 1; i < table.length; i++) {
      const firstCell = table[i][0] || ''
      const matches = firstCell.match(YEAR_PATTERN)
      if (matches) {
        years.push(parseInt(matches[0]))
        isRowYearFormat = true
      }
    }
  }

  if (years.length === 0) return []

  // 排序年份（从旧到新）
  years.sort((a, b) => a - b)

  const results: FinancialTable[] = []
  for (const year of years) {
    results.push({ year })
  }

  if (isRowYearFormat) {
    // 行年份格式：每行是一个年份
    for (let i = 1; i < table.length; i++) {
      const row = table[i]
      const firstCell = row[0] || ''
      const matches = firstCell.match(YEAR_PATTERN)
      if (!matches) continue

      const year = parseInt(matches[0])
      const yearIndex = years.indexOf(year)
      if (yearIndex === -1) continue

      const record = results[yearIndex]

      // 解析该行的其他数据（跳过第一列年份）
      for (let j = 1; j < row.length; j++) {
        // 需要从表头获取字段名
        const headerCell = header[j] || ''
        const field = extractKeyword(headerCell)
        if (!field) continue

        const rawValue = row[j].replace(/[,，%]/g, '').trim()
        const value = parseFloat(rawValue)

        if (!isNaN(value)) {
          if (row[j].includes('%')) {
            (record as Record<string, number | undefined>)[field] = value
          } else if (row[j].includes('亿')) {
            (record as Record<string, number | undefined>)[field] = value * 100000000
          } else if (row[j].includes('万')) {
            (record as Record<string, number | undefined>)[field] = value * 10000
          } else {
            (record as Record<string, number | undefined>)[field] = value
          }
        }
      }
    }
  } else {
    // 列年份格式：每列是一个年份（从第2列开始，因为第1列是行标签）
    for (let i = 1; i < table.length; i++) {
      const row = table[i]
      if (row.length < 2) continue

      const label = row[0].trim()
      const field = extractKeyword(label)
      if (!field) continue

      // 为每个年份分配数据（从第2列开始）
      for (let j = 0; j < years.length && j + 1 < row.length; j++) {
        const rawValue = row[j + 1].replace(/[,，%]/g, '').trim()
        const value = parseFloat(rawValue)

        if (!isNaN(value)) {
          const record = results[j]

          if (row[j + 1].includes('%')) {
            (record as Record<string, number | undefined>)[field] = value
          } else if (row[j + 1].includes('亿')) {
            (record as Record<string, number | undefined>)[field] = value * 100000000
          } else if (row[j + 1].includes('万')) {
            (record as Record<string, number | undefined>)[field] = value * 10000
          } else {
            (record as Record<string, number | undefined>)[field] = value
          }
        }
      }
    }
  }

  return results
}

/**
 * 解析单个财务表格（单条记录兼容版本）
 * 用于需要返回单条记录的场景
 */
function parseFinancialTableSingle(table: string[][]): FinancialTable | null {
  const results = parseFinancialTable(table)
  return results.length > 0 ? results[results.length - 1] : null
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