---
name: teamwork-preview
description: Teamwork Framework Phase 1 - 啟動對話式需求釐清。將模糊需求轉化為嚴謹的 `prompt_draft.md` 與驗收標準，準備交接給 Sentinel。
---

# Skill: Teamwork Preview (Phase 1)
當使用者想要啟動一個複雜的新專案，並請求使用 Teamwork 框架或輸入 `/teamwork-preview` 時，觸發此技能。

## Objectives
消除需求模糊地帶，建立完整的開發規範，避免 Orchestrator 拆解任務時因為規格不明而導致幻覺或走偏。

## Instructions
1.  **進入面試模式 (Elicit Idea)**：向使用者提出 3-5 個關鍵問題，詢問專案的具體目標、技術堆疊 (Stack) 偏好、以及預期的畫面/API 行為。
2.  **澄清模糊地帶 (Identify Ambiguity)**：如果使用者說「做一個論壇」，必須追問「是否需要身分認證？」、「是否有首頁與文章內頁設計要求？」。
3.  **定義完整性 (Determine Integrity)**：確定是「建立假資料即可」還是「需要連接真實資料庫」。
4.  **產出草案**：收集完畢後，在工作區根目錄或 `.agents/memory/` 產生 `prompt_draft.md`。內容必須包含：
    *   Project Request
    *   Acceptance Criteria (至少 3 條可被程式或腳本測試的具體驗收標準)
    *   Rules & Integrity (技術限制)
5.  **引導至 Phase 2**：提示使用者審閱 `prompt_draft.md`。若確認無誤，請使用者輸入 `/teamwork-launch` 進入全自動開發階段。
