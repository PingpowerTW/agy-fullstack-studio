---
name: api-spec
description: 設計與校驗前後端 OpenAPI 契約。生成 Swagger JSON 與對應的前後端 TypeScript/DTO 介面定義。
---

# Skill: /api-spec (前後端 API 契約設計)

此指令用於規範前後端通訊協議，實施「契約優先（Contract-First）」開發。確保前端與後端團隊能基於同一套 API Schema 獨立開發，零摩擦對接。

## When to Use
- 在開始撰寫 API Controllers (後端) 與 API Services (前端) 之前執行。
- 修改現有 API 參數或新增 API 端點時。

## 執行邏輯與流程 (Workflow)
當使用者輸入 `/api-spec` 時：
1. **API 定義收集**：
   - 與使用者確認 API 端點路由 (e.g. `/api/v1/users`)、HTTP 方法 (GET, POST, etc.)。
   - 定義 Request Headers/Query/Body 以及 Response Body (成功 200/201 與失敗 400/401/404/500)。
2. **生成 OpenAPI Spec (OAS)**：
   - 產生標準的 Swagger/OAS 3.0 YAML 格式定義，寫入 `docs/api/` 目錄。
3. **代碼生成與契約對齊**：
   - 自動為前端生成 TypeScript 介面定義（例如 `src/frontend/types/api.ts`）。
   - 自動為後端生成對應的 DTOs 與 Validator（如 NestJS 的 class-validator 類）。
4. **契約校驗**：
   - 稽核端點是否符合 RESTful 命名規範（使用名詞、複數，避用動詞）。
   - 檢查是否定義了明確的錯誤回傳格式與 status codes。
