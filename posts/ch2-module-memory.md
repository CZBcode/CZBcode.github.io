---
title: 第2章 · 四大核心能力模块 — 记忆系统 Memory
date: 2026-06-01
category: 技术笔记
series: Agent开发工程师知识体系
description: Agent记忆系统的三层架构：短时记忆（会话管理）、长时向量记忆（嵌入模型+向量库）、结构化实体记忆（用户画像）。
next: ch2-module-planning
nextTitle: 第2章 · 规划推理系统 Planning
---

## 为什么Agent需要记忆系统？

大模型的原生"记忆"只有上下文窗口，存在以下致命缺陷：

- 窗口有限，装不下所有历史信息
- 新对话会覆盖旧对话，无法跨会话保持记忆
- 所有信息混在一起，缺乏组织结构

因此Agent必须构建自己的记忆系统。

## 2.1 短时记忆（Short-term Memory）

管理当前会话窗口内的对话上下文。

### 核心能力

- **会话上下文管理**：维护当前对话的完整历史
- **滑动窗口截断**：当接近窗口上限时，淘汰最早的对话
- **冗余清洗**：去除重复、无意义的对话内容
- **上下文长度适配**：确保总Token数不超过模型限制

### 典型实现

```python
# 滑动窗口示例
class SlidingWindowMemory:
    def __init__(self, max_tokens: int = 8000):
        self.messages = []
        self.max_tokens = max_tokens
    
    def add(self, message: dict):
        self.messages.append(message)
        while self.count_tokens() > self.max_tokens:
            self.messages.pop(0)  # 淘汰最早的消息
```

## 2.2 长时向量记忆（Long-term Vector Memory）

将历史信息转化为向量存储，需要时通过语义相似度召回。

### 嵌入模型选择

- **BGE**（BAAI General Embedding）：中文效果好，开源免费
- **M3E**（Moka Massive Mixed Embedding）：多语言支持
- **all-MiniLM-L6-v2**：轻量级，速度快
- **OpenAI text-embedding-3**：商业API，质量高

### 向量数据库选型

| 数据库 | 特点 | 适用场景 |
|--------|------|---------|
| FAISS | Meta出品，纯内存，极快 | 中小规模、本地部署 |
| Chroma | 轻量级，嵌入式友好 | 原型开发、个人项目 |
| Milvus | 分布式，支持十亿级向量 | 大规模生产环境 |
| Qdrant | Rust编写，高性能过滤 | 需要复杂过滤的场景 |

### 高级能力

- **话题聚类**：将相关记忆归类到同一主题下
- **时效权重**：近期记忆权重更高，避免过时信息干扰
- **记忆归档**：将低价值记忆转移到冷存储

## 2.3 结构化实体记忆（Entity Memory）

以结构化方式存储关键实体信息，而非原始文本。

### 核心能力

- **用户画像抽取**：从对话中提取用户的偏好、习惯、关系等信息
- **关键信息结构化存储**：以JSON/图谱形式持久化
- **长期偏好记忆与更新**：随交互不断更新用户画像

### 典型数据结构

```json
{
  "user_id": "anthony_001",
  "preferences": {
    "programming_languages": ["Java", "Python"],
    "topics_of_interest": ["AI Agents", "Spring Boot"],
    "communication_style": "简洁直接"
  },
  "facts": [
    {"entity": "Anthony", "relation": "works_at", "value": "云雀平台"},
    {"entity": "Anthony", "relation": "github", "value": "CZBcode"}
  ],
  "last_updated": "2026-06-01"
}
```

## 三层记忆的协作

1. 用户发送消息 → 进入**短时记忆**
2. 短时记忆触发查询 → 从**长时向量记忆**召回相关信息
3. 从**实体记忆**加载用户画像和偏好
4. 三者合并后送入模型生成回复
5. 重要信息写入长时记忆和实体记忆

---

*本章为《Agent开发工程师知识体系》第2章第1节，下一节：规划推理系统 Planning。*
