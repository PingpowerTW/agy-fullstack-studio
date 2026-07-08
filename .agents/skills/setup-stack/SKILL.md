---
name: setup-stack
description: 初始化全端專案目錄結構。建立前端、後端、資料庫與運維基礎目錄，並提供標準設定檔範本。
---

# Skill: /setup-stack (初始化全端目錄)

此指令用於快速將一個空專案目錄初始化為符合本工作室規範的全端應用目錄結構。

## When to Use
- 在專案建立初期，確定技術棧之後執行。

## 執行邏輯與流程 (Workflow)
當使用者輸入 `/setup-stack` 時：
1. **建立目錄**：
   - 建立 `src/frontend` (存放 Next.js/React 前端)
   - 建立 `src/backend` (存放 NestJS/Express 後端)
   - 建立 `src/db/migrations` (存放 SQL Schema 遷移腳本)
   - 建立 `src/devops` (存放 Dockerfile, CI/CD, Nginx 設定)
   - 建立 `tests/` (存放 E2E, Unit tests)
   - 建立 `docs/templates/` 存放文件範本
2. **初始化標準設定**：
   - 提供標準的 `.gitignore`（包含排除 node_modules、.env、dist 的設定）。
   - 提供 `docker-compose.yml` 範本（包含預設 PostgreSQL、Redis 與 App 的本地多容器設定）。
   - 初始化 `active.md` 進度追蹤器。
3. **完成報告**：
   - 列出所有已建立的檔案路徑，並提示使用 `/prd` 開始需求設計。
