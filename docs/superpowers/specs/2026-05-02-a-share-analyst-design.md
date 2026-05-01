# A-Share-Analyst 金融估值系统设计方案

> **Date:** 2026-05-02
> **Status:** Approved

## 设计决策

| 维度 | 选择 |
|------|------|
| 视觉风格 | Cyber Finance — 赛博朋克金融风 |
| 布局方式 | Multi-page routing (多页面路由) |
| 数据展示 | Chart-driven (图表驱动) |
| 配色方案 | Electric Blue + Neon Orange |

---

## 设计语言

### 配色系统

```css
:root {
  /* 主色 - Electric Blue */
  --color-primary: #3b82f6;
  --color-primary-glow: rgba(59, 130, 246, 0.4);

  /* 辅助色 - Neon Orange */
  --color-accent: #f97316;
  --color-accent-glow: rgba(249, 115, 22, 0.4);

  /* 背景 - Deep Space */
  --bg-base: #0a0a0f;
  --bg-surface: #12121a;
  --bg-elevated: #1a1d26;
  --bg-hover: #252a36;

  /* 文字 */
  --text-primary: #f3f4f6;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;

  /* 状态色 */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-purple: #a855f7;
}
```

### 动效规范

| 类型 | 参数 |
|------|------|
| 入场动画 | 600ms, cubic-bezier(0.16, 1, 0.3, 1) |
| 悬浮光效 | box-shadow 动态扩展，边框发光 |
| 数字变化 | 计数动画 + 颜色渐变过渡 |
| 图表动画 | 从下往上渐入，stagger 100ms |

### 玻璃态设计

- 背景: `rgba(255, 255, 255, 0.03)`
- 边框: `1px solid rgba(255, 255, 255, 0.1)`
- 圆角: 12px
- 悬浮: 边框变为 `rgba(59, 130, 246, 0.3)`

---

## 页面结构

### 路由

| 路径 | 页面 |
|------|------|
| `/` | 首页 - 价值投资入口 |
| `/analyze` | 单公司分析页 |
| `/pool` | 股票池页 |
| `/portfolio` | 组合管理页 |
| `/settings` | 设置页 |

### 导航设计

- 顶部固定导航栏
- Logo 居左，导航链接居中，功能按钮（搜索、通知）居右
- 导航激活态：下划线 + 发光效果

---

## 首页 (/)

### Hero Section
- 标题：价值投资深度分析系统
- 副标题：基于四维框架（骨-筋-肉-血）精准测算安全边际
- CTA 按钮：开始分析 →

### 四维框架卡片

| 维度 | 标题 | 说明 |
|------|------|------|
| 骨 | 经济数据 | 通胀/就业/PMI |
| 筋 | 资产周期 | 美林时钟 |
| 肉 | 宏观政策 | 财政/产业扶持 |
| 血 | 流动性 | 汇率/信贷脉冲 |

---

## 分析页 (/analyze)

### Tab 导航
- 估值概览（默认）
- 财务分析
- 风险评估
- 宏观环境

### 估值概览

#### 主指标卡片
- 当前价格
- 内在价值
- 安全边际
- 买入信号

#### 估值仪表盘
- DCF/DDM/PE 多模型对比
- 推荐模型高亮

### 财务分析 Tab

#### 图表组件
- **营收/利润趋势图** — 柱状图，双系列
- **ROE/ROIC 趋势图** — 面积图
- **现金流趋势图** — 堆叠柱状图
- **毛利率/净利率趋势** — 折线图

### 风险评估 Tab

#### 组件
- **风险雷达图** — 六维度评分
- **风险指标卡片** — 资产负债率、现金流转换等

### 宏观环境 Tab

#### 组件
- **宏观看板** — CN10Y、USD/CNY、LPR、社融增速
- **流动性评估** — 宽货币/紧信用状态
- **中美利差图** — 时序图

---

## 股票池页 (/pool)

### 功能
- 筛选器（行业、市值、估值区间）
- 排序（安全边际、ROE、营收增速）
- 批量导出

---

## 组合管理页 (/portfolio)

### 功能
- 持仓列表
- 组合收益率
- 风险敞口

---

## 技术实现

### 技术栈
- Next.js 16 + React 19
- Tailwind CSS v4
- Recharts
- Lucide React
- Framer Motion (动画)

### 组件架构

```
src/
├── app/
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页
│   ├── analyze/
│   ├── pool/
│   ├── portfolio/
│   └── settings/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── NavLink.tsx
│   │   └── Logo.tsx
│   ├── charts/
│   │   ├── AreaChart.tsx
│   │   ├── BarChart.tsx
│   │   ├── RadarChart.tsx
│   │   └── LineChart.tsx
│   ├── dashboard/
│   │   ├── ValuationCard.tsx
│   │   ├── FourDimensionsPanel.tsx
│   │   ├── MacroBoard.tsx
│   │   └── RiskMetrics.tsx
│   └── ui/
│       ├── Card.tsx
│       ├── Button.tsx
│       ├── Badge.tsx
│       └── Tabs.tsx
├── lib/
│   └── utils.ts
└── styles/
    └── globals.css
```

---

## 待实现清单

- [ ] 重构 globals.css 设计系统
- [ ] 实现玻璃态卡片组件
- [ ] 实现霓虹发光按钮组件
- [ ] 重构首页 Hero + 四维框架
- [ ] 实现估值仪表盘
- [ ] 实现图表组件（柱状图、面积图、雷达图）
- [ ] 实现分析页 Tab 导航
- [ ] 重构股票池页
- [ ] 重构组合管理页