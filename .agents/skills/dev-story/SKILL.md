---
name: dev-story
description: 鎖定特定 User Story 開始分支開發。自動建立/載入 Story context 追蹤，載入專屬規則，開始程式碼實作。
---

# Skill: /dev-story (Story 開發狀態鎖定)

此指令用於將目前的 AI 會話聚焦於特定任務（User Story），建立乾淨的工作環境，並自動將進度記錄至 `active.md`，防止上下文發散。

## When to Use
- 開始實作某個特定功能或修復特定 Bug 時。

## 執行邏輯與流程 (Workflow)
當使用者輸入 `/dev-story <story_id>` 時：
1. **讀取任務 Context**：
   - 從任務清單（`task.md`）讀取該故事的詳細描述與驗證條件（Acceptance Criteria）。
2. **初始化工作分支**：
   - 提示使用者（或自動執行）切換至新 Git 分支 `feature/story-<story_id>`。
   - 將該 Story 設定為當前的 Active Task，寫入 `active.md`。
3. **專屬規則載入**：
   - 根據 Story 的類型（例如前端 UI、後端 API 或 DevOps），特別載入該路徑對應的 rules 約束。
4. **輸出指引**：
   - 輸出開發本 Story 的實作計畫草案、需要修改的檔案列表與測試檔案推薦。
   - 提示使用 `/story-done` 來提交開發結果。
