---
name: start
description: 啟動全端專案開發引導。分析目前專案狀態，引導使用者進入適合的開發流程。
---

# Skill: /start (全端開發起點引導)

此指令用於分析當前全端專案所屬的階段，並主動引導使用者進入適合的工作流程。

## When to Use
- 在每次啟動 Antigravity 開發會話時執行。
- 在接手新的功能開發或從中斷的工作恢復時執行。

## 執行邏輯與流程 (Workflow)
當使用者輸入 `/start` 時：
1. **狀態探測**：
   - 檢查專案是否包含 PRD（在 `docs/PRD.md`）與系統架構圖。
   - 檢查是否有未完成的 User Stories（在 `active.md` 或 `task.md`）。
   - 檢查是否有程式碼、資料庫 Migration 歷史或測試套件。
2. **決策樹**：
   - **無 PRD、無代碼**：引導至 `/prd` 進行需求分析，隨後進行系統建模。
   - **有 PRD、無代碼**：引導至 `/db-schema` 與 `/api-spec` 進行架構決策。
   - **已有代碼、需開發新功能**：引導至 `/create-stories` 與 `/dev-story` 開始 Sprint 開發。
   - **已有代碼、有 bugs 需除錯**：引導至安全與測試稽核流程（`/qa-check` 與 `/security-audit`）。
3. **報告與下一步**：
   - 輸出當前專案健康度與目前工作的 Epic/Story 麵包屑導航。
   - 提供下一步操作推薦指令。
