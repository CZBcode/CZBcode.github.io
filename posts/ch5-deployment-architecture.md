---
title: 第5章 · 工程部署和性能优化 — 服务部署架构
date: 2026-06-01
category: 技术笔记
series: Agent开发工程师知识体系
description: FastAPI封装、Docker容器化、高可用架构设计——将Agent系统部署到生产环境的完整指南。
---

## 8.1 FastAPI Agent服务封装


将Agent包装为标准的HTTP API服务。


### 基本架构


```
from fastapi import FastAPI, Request

from fastapi.responses import StreamingResponse

import json


app = FastAPI(title="Agent API")


@app.post("/chat")

async def chat(request: Request):

    body = await request.json()

    message = body["message"]

    

    # 流式输出（推荐）

    async def generate():

        async for chunk in agent.stream_chat(message):

            yield f"data: {json.dumps(chunk)}\n\n"

    

    return StreamingResponse(generate(), media_type="text/event-stream")


@app.post("/chat/completions")

async def completions(request: Request):

    # 兼容 OpenAI API 格式

    ...
```


### 关键设计点


- **流式输出**：用SSE（Server-Sent Events）实现逐token输出


- **兼容OpenAI格式**：可以直接替换为OpenAI SDK的base_url


- **异步处理**：FastAPI原生async，配合异步Agent框架


- **请求校验**：Pydantic模型做输入验证


## 8.2 Docker容器化部署


### Dockerfile最佳实践


```
# 多阶段构建，减小镜像体积

FROM python:3.11-slim as builder

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt


FROM python:3.11-slim

WORKDIR /app

COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```


### docker-compose.yml


```
version: '3.8'

services:

  agent-api:

    build: .

    ports:

      - "8000:8000"

    environment:

      - OPENAI_API_KEY=${OPENAI_API_KEY}

      - REDIS_URL=redis://redis:6379

    depends_on:

      - redis

      - qdrant

  

  redis:

    image: redis:7-alpine

    

  qdrant:

    image: qdrant/qdrant

    ports:

      - "6333:6333"
```


## 8.3 私有化部署 vs Serverless


| 私有化部署 | Serverless |  |
| --- | --- | --- |
| 固定服务器成本 | 按调用付费 |  |
| 低（无冷启动） | 可能有冷启动 |  |
| 完全可控 | 依赖云厂商 |  |
| 需要运维 | 免运维 |  |
| 手动扩缩容 | 自动扩缩容 |  |


## 8.4 高可用架构


### 8.4.1 队列


- 用消息队列（Redis Stream / RabbitMQ / Kafka）削峰填谷


- 高峰期请求排队，避免压垮后端


- 支持异步处理长时间任务


### 8.4.2 限流


- **用户级限流**：每个用户每分钟最多N次请求


- **全局限流**：整个服务每秒最多处理M个请求


- **Token级限流**：防止单个用户消耗过多资源


- 工具：Redis + 令牌桶/滑动窗口算法


### 8.4.3 熔断


- 当下游服务（LLM API、向量库）故障率达到阈值时自动熔断


- 熔断期间返回降级响应（如"服务繁忙，请稍后重试"）


- 定期探测下游是否恢复，自动关闭熔断


### 8.4.4 重试


- **指数退避重试**：1s → 2s → 4s → 8s，最多3次


- **仅对幂等操作重试**：GET、PUT可以重试，POST要看情况


- **区分可重试和不可重试错误**：429 Too Many Requests 可重试，400 Bad Request 不重试


---


*本章为《Agent开发工程师知识体系》第5章最后一节，下一章：多Agent高阶系统。*