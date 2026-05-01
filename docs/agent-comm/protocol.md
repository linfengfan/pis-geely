# Agent 通信协议

## 消息格式

所有 Agent 间通信使用以下格式：

```markdown
---
from: [Agent名称]
to: [目标Agent或主控]
timestamp: [ISO时间]
type: [request/progress/done/error]
---

[消息内容]
```

## 通信状态

### 状态值
- `pending` - 待处理
- `in_progress` - 进行中
- `completed` - 已完成
- `failed` - 失败
- `blocked` - 阻塞

### 状态文件
每个任务的状态记录在 `/docs/agent-comm/status.md`：

```markdown
# 项目状态

## 当前阶段：产品规划

## 阶段状态
- [x] 需求接收: completed
- [ ] 产品规格: in_progress ← Product Agent 处理中
- [ ] 开发实现: pending
- [ ] 测试验证: pending

## 最新消息
[timestamp] [Agent]: [消息摘要]
```

## 错误处理

### 错误类型
1. **输入错误** - 缺少必要文件或参数
2. **执行错误** - 任务执行失败
3. **通信错误** - Agent 间通信中断

### 错误报告格式
```markdown
## ❌ 错误报告

from: [Agent名称]
error_type: [错误类型]
message: [错误描述]
suggestion: [修复建议]
```

## 同步机制

1. 每个 Agent 完成工作后更新 status.md
2. 主控 Agent 定期检查状态文件
3. 阻塞时发送通知给相关 Agent