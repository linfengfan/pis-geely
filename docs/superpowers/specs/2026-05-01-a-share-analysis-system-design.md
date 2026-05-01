# A 股分析系统 v1.0 设计文档

**日期**: 2026-05-01
**状态**: 进行中
**类型**: 完整功能系统

---

## 1. 项目概述

### 1.1 目标

构建一个 A 股价值投资分析系统，帮助用户：
- 手动上传公司年报（.md格式）
- 自动提取财务数据，应用四维分析框架
- 输出估值结果与可视化报告

### 1.2 系统定位

| 组件 | 说明 |
|------|------|
| 数据层 | 手动输入（.md上传 + 宏观手动填） |
| 分析层 | 全框架（骨-筋-肉-血 + DCF/DDM/PE/PEG/EV-EBITDA） |
| 展示层 | 报告 + 仪表盘全开 |

### 1.3 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 16, React 19, TailwindCSS 4 |
| 后端 | Node.js (Express/Fastify) |
| 数据库 | PostgreSQL (Prisma) + MongoDB (Mongoose) |
| 图表 | Recharts / Ant Design Charts |

---

## 2. 功能模块

### 2.1 模块总览

```
├── 分析模块 (analyze)
│   ├── 单公司分析
│   ├── .md 文件解析
│   └── 四维分析引擎
│
├── 股票池模块 (pool)
│   ├── 公司管理
│   ├── 批量对比
│   └── 排序筛选
│
├── 组合模块 (portfolio)
│   ├── 持仓管理
│   ├── 手动价格更新
│   └── 盈亏跟踪
│
└── 设置模块 (settings)
    ├── 宏观数据录入
    └── 系统配置
```

### 2.2 单公司分析 (A)

**流程**:
1. 用户输入公司名称 + 股票代码
2. 上传 .md 年报文件
3. 系统解析 .md，提取财务数据
4. 用户输入宏观参数（CN10Y, USD/CNY, LPR）
5. 系统执行四维分析
6. 输出：文字报告 + 可视化仪表盘

**输入规格**:
- .md 文件：包含文字说明 + Markdown 表格
- 表格格式：Markdown table，需包含以下关键数据：

```
| 科目 | 2020 | 2021 | 2022 | 2023 | 2024 |
|------|------|------|------|------|------|
| 营业收入 | xxx | xxx | xxx | xxx | xxx |
| 净利润 | xxx | xxx | xxx | xxx | xxx |
| ... | ... | ... | ... | ... | ... |
```

### 2.3 股票池对比 (B)

**功能**:
- 添加多个公司到股票池
- 批量分析
- 多维度排序（PE/ROE/安全边际）
- 行业分类

### 2.4 组合跟踪 (C)

**功能**:
- 创建虚拟组合
- 记录买入价格和数量
- 手动更新最新价格
- 计算浮盈亏
- 组合收益率统计

---

## 3. 数据模型

### 3.1 实体关系

```
Company (公司)
    ├── id
    ├── name (名称)
    ├── code (股票代码)
    ├── industry (行业)
    └── companyType (公司类型: 银行/消费/科技/重资产)

FinancialData (财务数据)
    ├── id
    ├── companyId
    ├── year
    ├── revenue (营收)
    ├── netProfit (净利润)
    ├── totalAssets (总资产)
    ├── totalLiabilities (总负债)
    ├── equity (所有者权益)
    ├── operatingCashFlow (经营现金流)
    ├── investingCashFlow (投资现金流)
    ├── financingCashFlow (融资现金流)
    ├── grossMargin (毛利率)
    ├── netMargin (净利率)
    ├── roe (净资产收益率)
    ├── roic (投资资本回报率)
    └── debtRatio (资产负债率)

Analysis (分析记录)
    ├── id
    ├── companyId
    ├── createdAt
    ├── macroData (宏观数据快照)
    │   ├── cn10y (国债收益率)
    │   ├── usdcny (汇率)
    │   ├── lpr (LPR)
    │   └── socialFinancing (社融)
    ├── result (分析结果)
    │   ├── conclusion (结论)
    │   ├── valuation (估值)
    │   ├── riskScore (风险评分)
    │   └── modelUsed (使用模型)
    └── markdown (原始.md内容)

Portfolio (组合)
    ├── id
    ├── name
    └── createdAt

Holding (持仓)
    ├── id
    ├── portfolioId
    ├── companyId
    ├── buyPrice (买入价)
    ├── buyQuantity (买入数量)
    ├── currentPrice (当前价，手动更新)
    └── updatedAt

MacroSnapshot (宏观快照)
    ├── id
    ├── cn10y
    ├── usdcny
    ├── lpr
    ├── m2 (M2)
    ├── socialFinancing (社融)
    ├── cpi (CPI)
    ├── pmi (PMI)
    └── createdAt
```

### 3.2 公司类型枚举

```typescript
enum CompanyType {
  BANK_WATER = '银行/公用',  // DDM/RIM/PB-ROE
  CONSUMER = '消费/公用',     // DCF (FCFF/FCFE)
  GROWTH = '成长型',          // PE/PEG
  HEAVY_ASSET = '重资产'      // EV/EBITDA
}
```

---

## 4. 分析引擎

### 4.1 四维分析框架

#### 骨（骨架）- 宏观环境
- 输入：CN10Y, USD/CNY, LPR, 社融
- 输出：无风险利率 Rf, 流动性评估

#### 筋（周期）- 资产周期
- 输入：营收/利润5年趋势
- 输出：美林时钟阶段判断, 库存周期位置

#### 肉（政策）- 产业政策
- 输入：.md 中的管理层讨论、宏观政策
- 输出：政策影响评估

#### 血（流动性）- 资金流向
- 输入：经营现金流, 自由现金流
- 输出：造血能力评估

### 4.2 估值模型路由

```typescript
function selectValuationModel(company: Company, financialData: FinancialData): string {
  // 1. 重资产优先
  if (financialData.debtRatio > 60 || financialData.totalAssets > 净资产 * 3) {
    return 'EV/EBITDA'
  }

  // 2. 高股息判断
  if (dividendYield > 5%) {
    return 'DDM'
  }

  // 3. 银行/公用判断
  if (companyType === '银行/公用') {
    return 'DDM/PB-ROE'
  }

  // 4. 成长型判断
  if (revenueGrowth > 20% && netProfitGrowth > 15%) {
    return 'PE/PEG'
  }

  // 5. 默认：DCF
  return 'DCF'
}
```

### 4.3 估值计算

#### DCF (现金流折现)
```
内在价值 = Σ(FCF_t / (1 + Rf + β)^t) + Terminal Value
- FCF = 经营现金流 - 资本支出
- Rf = 无风险利率（CN10Y）
- β = 风险系数
- Terminal Growth Rate = 2%~3%
```

#### PE/PEG
```
合理PE = Growth Rate / (Rf - 1) * 100
内在价值 = EPS * 合理PE
PEG = PE / (GrowthRate * 100)
```

#### EV/EBITDA
```
内在价值 = EBITDA * Multiple - 净负债
Multiple = 行业均值 * 安全边际调整
```

#### DDM (股息折现)
```
内在价值 = Σ(D_t / (1 + Rf)^t) + D_(n+1) / (Rf - g)
```

### 4.4 安全边际计算

```typescript
function calculateMarginOfSafety(currentPrice: number, intrinsicValue: number): number {
  return (intrinsicValue - currentPrice) / intrinsicValue
}

// 买入信号：安全边际 >= 30%
```

---

## 5. 可视化设计

### 5.1 估值仪表盘

```
┌─────────────────────────────────────────────────────────┐
│  [公司名称]  [股票代码]                    分析时间: xxx │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  当前价格    │  │  内在价值   │  │  安全边际    │    │
│  │   ¥XX.XX    │  │   ¥XX.XX    │  │   XX.X%     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │          价格 vs 内在价值 折线图                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  结论: [买入/观望/清仓/规避]                            │
└─────────────────────────────────────────────────────────┘
```

### 5.2 财务趋势图

```
┌─────────────────────────────────────────────────────────┐
│  5年财务趋势                                            │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │   营收/利润趋势（双Y轴）                          │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │   ROE/ROIC趋势                                   │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │   现金流趋势                                      │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 5.3 竞争力对比

```
┌─────────────────────────────────────────────────────────┐
│  行业对比: [公司] vs 行业平均 vs 头部竞争对手            │
├─────────────────────────────────────────────────────────┤
│  毛利率:  ████████████░░░ 45%  vs 行业35% vs XX公司50% │
│  净利率:  ██████████░░░░░ 25%  vs 行业18% vs XX公司30% │
│  ROE:     █████████████░░ 22%  vs 行业15% vs XX公司28% │
│  现金流:  ████████████░░░ 1.2  vs 行业0.8 vs XX公司1.5 │
└─────────────────────────────────────────────────────────┘
```

### 5.4 风险雷达

```
┌─────────────────────────────────────────────────────────┐
│  风险雷达                                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│              资产负债率                                  │
│                  ▲                                       │
│                 ╱ ╲                                      │
│                ╱   ╲    现金流                          │
│      应收帐款 ╱     ╲    ▲                             │
│        ▲     ╱       ╲   │                              │
│       ╱ ╲   ╱    ●    ╲  │      ← 综合评分             │
│      ╱   ╲ ╱           ╲ │                             │
│     ╱     ╲              ╲▼                            │
│    ▼       ╲            利润                           │
│  存货        ╲___________▼                              │
│                                                         │
│  评分: 85/100  状态: [良好/警告/危险]                   │
└─────────────────────────────────────────────────────────┘
```

### 5.5 宏观看板

```
┌─────────────────────────────────────────────────────────┐
│  宏观环境                                               │
├──────────────────────┬──────────────────────┬──────────┤
│ 无风险利率           │ 汇率                 │ LPR      │
│ CN10Y: X.XX%         │ USD/CNY: X.XXXX      │ X.xx%    │
├──────────────────────┼──────────────────────┼──────────┤
│ 社融增量             │ M2同比               │ CPI      │
│ +XX%                 │ XX%                  │ XX%      │
├──────────────────────┴──────────────────────┴──────────┤
│ 流动性评估: [宽松/中性/紧缩]                            │
└─────────────────────────────────────────────────────────┘
```

---

## 6. API 设计

### 6.1 接口列表

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/company | 创建公司 |
| GET | /api/company | 获取公司列表 |
| GET | /api/company/:id | 获取公司详情 |
| POST | /api/company/:id/financial | 添加财务数据 |
| POST | /api/analyze | 执行分析 |
| GET | /api/analyze/:companyId/history | 分析历史 |
| GET | /api/pool | 股票池列表 |
| POST | /api/pool/compare | 批量对比 |
| GET | /api/portfolio | 组合列表 |
| POST | /api/portfolio | 创建组合 |
| PUT | /api/holding/:id/price | 更新持仓价格 |
| POST | /api/macro | 保存宏观数据 |
| GET | /api/macro/latest | 获取最新宏观数据 |

### 6.2 分析接口

```typescript
// POST /api/analyze
// Request
{
  companyId: string,
  macroData: {
    cn10y: number,      // 2.5
    usdcny: number,     // 7.25
    lpr: number,        // 3.45
    socialFinancing: number  // 9.5
  }
}

// Response
{
  success: true,
  data: {
    company: { id, name, code },
    companyType: string,
    selectedModel: 'DCF',
    conclusion: '买入',
    intrinsicValue: 45.6,
    currentPrice: 32.1,
    marginOfSafety: 29.5,  // %
    riskScore: 72,
    report: {
      macro: { ... },
      fundamentals: { ... },
      valuation: { ... },
      strategy: { ... }
    },
    visualizations: { ... }
  }
}
```

---

## 7. 前端页面

### 7.1 路由结构

```
/                           首页/概览
/analyze                    分析页
  /analyze/new              新建分析
  /analyze/[id]             分析详情
/pool                       股票池
  /pool/compare              对比视图
/portfolio                  组合管理
  /portfolio/[id]           组合详情
/settings                   设置
  /settings/macro           宏观数据
```

### 7.2 组件清单

| 组件 | 说明 |
|------|------|
| ValuationDashboard | 估值仪表盘 |
| FinancialTrendChart | 财务趋势图 |
| CompetitiveRadar | 竞争力雷达图 |
| RiskRadar | 风险雷达图 |
| MacroBoard | 宏观看板 |
| AnalysisReport | 文字报告展示 |
| CompanyCard | 公司卡片 |
| StockPoolTable | 股票池表格 |
| PortfolioHolding | 持仓展示 |

---

## 8. 里程碑

### M1: 基础框架 (2周)
- [ ] 项目初始化 (Next.js + Node.js)
- [ ] 数据库设计 + Prisma schema
- [ ] 基础 API 框架
- [ ] 公司 CRUD

### M2: 分析核心 (2周)
- [ ] .md 解析器
- [ ] 四维分析引擎
- [ ] DCF 估值模型
- [ ] 分析报告输出

### M3: 可视化 (2周)
- [ ] 估值仪表盘
- [ ] 财务趋势图
- [ ] 风险雷达
- [ ] 宏观看板

### M4: 股票池 + 组合 (1周)
- [ ] 股票池管理
- [ ] 批量对比
- [ ] 组合创建
- [ ] 持仓跟踪

### M5: 全模型支持 (1周)
- [ ] DDM 模型
- [ ] PE/PEG 模型
- [ ] EV/EBITDA 模型
- [ ] 模型自动路由

---

## 9. 待确认事项

- [ ] .md 文件的具体格式模板
- [ ] 是否需要用户登录系统
- [ ] 数据导出格式（Excel/PDF）
- [ ] 预警通知机制

---

**下一步**: 根据此规格，生成详细实现计划。