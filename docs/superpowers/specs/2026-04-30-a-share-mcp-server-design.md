# A 股 MCP Server 设计文档

**日期**: 2026-04-30
**状态**: 已批准
**类型**: 技术实现

---

## 1. 目标

构建一个 Node.js MCP Server，为 Claude Code 提供 A 股财报数据，支持价值投资分析工作流。

---

## 2. 技术选型

| 选项 | 选择 | 理由 |
|------|------|------|
| 数据类型 | B（精简版） | 财报三大表 + 日均价，无需实时行情 |
| 时间跨度 | 可配置 | 调用时指定 years 参数 |
| 技术栈 | Node.js | 用户背景为前端，Node 更熟悉 |
| 输出格式 | JSON + 预计算指标 | 减少 AI Token 消耗 |
| 数据源 | @wbavon/china-market-data | npm 已存在，支持多数据源自动切换 |
| 运行时 | stdio 独立进程 | 配置简单，Claude Code 原生支持 |

---

## 3. 架构

```
Claude Code
    │
    ├── .mcp-config.json
    │   └── ashare-data-provider → node_modules/@wbavon/china-market-data
    │
    ├── .clinerules
    │   └── 分析规则（手术刀式）
    │
    └── A-Share-Analyst/
        ├── stocks/           # 分析报告输出
        └── data_sink/        # 原始数据快照
```

---

## 4. 数据指标（预计算）

根据 `.clinerules` 要求，Server 返回数据时预计算以下指标：

| 指标 | 公式 | 用途 |
|------|------|------|
| 净利润现金含量 | 经营现金流净额 / 净利润 | 盈利质量审计 |
| 资本支出占比 | 资本支出 / 营业收入 | 识别吞金兽 |
| 应收账款占比变化 | (本期 - 上期) / 上期 | 识别虚增收入 |
| 日均价格 | 当日均价（若有） | 估值计算底座 |

---

## 5. MCP 接口设计

### 5.1 get_financial_report

获取指定股票近 N 年财报数据。

**参数**:
- `code`: string - 股票代码（如 "600519"）
- `years`: number - 数据年份跨度（默认 5）

**返回**:
```json
{
  "code": "600519",
  "name": "贵州茅台",
  "reports": [
    {
      "year": 2024,
      "income_statement": { ... },
      "balance_sheet": { ... },
      "cash_flow": { ... },
      "metrics": {
        "cash_ratio": 1.168,
        "capex_ratio": 0.08,
        "receivable_change": -0.05
      },
      "avg_price": 1680.50
    }
  ]
}
```

### 5.2 get_company_info

获取公司基本信息（名称、行业、市值）。

**参数**:
- `code`: string - 股票代码

**返回**:
```json
{
  "code": "600519",
  "name": "贵州茅台",
  "industry": "白酒",
  "market_cap": 2100000000000
}
```

---

## 6. 配置更新

### 6.1 .mcp-config.json

```json
{
  "mcpServers": {
    "ashare-data-provider": {
      "command": "npx",
      "args": ["@wbavon/china-market-data"]
    }
  }
}
```

### 6.2 .clinerules

沿用现有规则，Server 返回的数据格式需匹配 `.clinerules` 中的分析逻辑。

---

## 7. 目录结构

```
A-Share-Analyst/
├── .claude/settings.local.json  # 权限配置
├── .mcp-config.json            # MCP Server 配置
├── .clinerules                 # 分析规则
├── stocks/                     # 分析报告输出
└── data_sink/                  # 数据缓存
```

---

## 8. 实现步骤

1. 安装 `@wbavon/china-market-data`
2. 更新 `.mcp-config.json` 配置
3. 测试 `get_financial_report("600519")` 是否返回数据
4. 验证预计算指标是否正确
5. 运行首次完整分析（600519 贵州茅台）

---

## 9. 风险与备选

| 风险 | 备选方案 |
|------|----------|
| @wbavon/china-market-data 功能不足 | 改用 eastmoney-data-sdk + 自己封装 MCP |
| 数据源不稳定 | 多数据源自动切换已在包内实现 |
| 预计算指标不够精确 | 后续可自定义 fork 或包装层 |

---

## 10. 成功标准

- [ ] Claude Code 能通过 MCP 获取 600519 近 5 年财报数据
- [ ] 返回数据包含预计算指标（cash_ratio, capex_ratio 等）
- [ ] 首次分析报告成功写入 `stocks/600519_贵州茅台.md`
- [ ] 全流程 Token 消耗在可接受范围
