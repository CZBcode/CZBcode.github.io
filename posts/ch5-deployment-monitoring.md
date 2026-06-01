---
title: 第5章 · 工程部署和性能优化 — 可观测监控体系
date: 2026-06-01
category: 技术笔记
series: Agent开发工程师知识体系
description: 全链路日志埋点、核心指标统计、异常告警机制——构建生产级Agent监控体系。
---

## 为什么Agent需要可观测性？


传统应用的日志只能看到"输入→输出"，而Agent的执行过程是**多步骤、多分支、非确定性**的。没有完善的可观测性，你将面临：


- 出了问题不知道哪一步出的


- 不知道Token花在哪了


- 无法评估Agent的实际表现


- 用户投诉时无法复现


## 7.1 全链路日志埋点


### 7.1.1 规划步骤日志


记录Agent的每一次"思考"：


```
{

  "trace_id": "abc123",

  "step_type": "planning",

  "timestamp": "2026-06-01T16:00:00Z",

  "input": "帮我分析这份财报",

  "thought": "用户需要财务分析，我应该：1.读取文件 2.提取关键指标 3.生成分析报告",

  "plan": ["read_file", "extract_metrics", "generate_report"],

  "tokens_used": 250,

  "latency_ms": 1200

}
```


### 7.1.2 工具调用日志


记录每一次工具调用的详细信息：


```
{

  "trace_id": "abc123",

  "step_type": "tool_call",

  "tool_name": "search_database",

  "input": {"query": "Q1 revenue"},

  "output": {"results": [...], "count": 15},

  "success": true,

  "latency_ms": 350,

  "tokens_used": 0

}
```


### 7.1.3 LLM请求响应日志


记录每次与大模型的交互：


```
{

  "trace_id": "abc123",

  "step_type": "llm_call",

  "model": "gpt-4o",

  "prompt_tokens": 1500,

  "completion_tokens": 300,

  "total_tokens": 1800,

  "latency_ms": 3200,

  "finish_reason": "stop",

  "response_preview": "根据财报数据..."

}
```


## 7.2 核心指标统计


### 7.2.1 Token消耗


- **总Token消耗**：每日/每月的总量和趋势


- **单次平均Token**：每个请求的平均消耗


- **Token分布**：Prompt vs Completion 的比例


- **成本追踪**：换算为美元/人民币的费用


### 7.2.2 响应耗时


- **P50/P95/P99延迟**：不同百分位的响应时间


- **耗时分解**：LLM推理 vs 工具调用 vs 其他


- **慢请求分析**：找出最慢的请求及其瓶颈


### 7.2.3 任务成功率


- **端到端成功率**：用户请求最终得到满意答复的比例


- **步骤级成功率**：每一步操作的独立成功率


- **失败分类**：按失败原因归类统计


### 7.2.4 幻觉率


- 这是Agent特有的指标——模型编造信息的比例


- 需要人工抽样或自动校验来测量


- 目标：控制在5%以下


### 7.2.5 工具调用错误率


- 每种工具的成功/失败率


- 常见错误类型分布


- 超时率和重试率


## 7.3 异常告警机制


### 告警规则示例


| 条件 | 严重级别 | 通知方式 |  |
| --- | --- | --- | --- |
| > 5% (5min) | 🔴 P0 | 短信+电话 |  |
| > 30s (5min) | 🟠 P1 | IM+邮件 |  |
| > 预算 80% (日) | 🟡 P2 | 邮件 |  |
| > 10% (1h) | 🟠 P1 | IM+邮件 |  |


### 推荐的可观测性工具


- **LangSmith**：LangChain官方 tracing平台


- **Arize Phoenix**：开源LLM可观测性平台


- **LangFuse**：开源，支持多框架


- **OpenTelemetry**：标准化的遥测协议，可对接任何后端


---


*本章为《Agent开发工程师知识体系》第5章第2节，下一节：服务部署架构。*