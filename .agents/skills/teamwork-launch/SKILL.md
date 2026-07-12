---
name: teamwork-launch
description: Teamwork Framework Phase 2 - 啟動全自動開發團隊。將 `prompt_draft.md` 讀入並啟動 `delegation.ts` 訊息匯流排，展開 Orchestrator 調度流程。
---

# Skill: Teamwork Launch (Phase 2)
當使用者確定了 `prompt_draft.md`，並輸入 `/teamwork-launch` 時，觸發此技能。

## Objectives
接手 Phase 1 的需求產出，啟動 `sentinel` 初始化專案，並透過 `delegation.ts` 機制讓 Agent 團隊全自動接手。

## Instructions
1.  **確認前置作業**：檢查 `prompt_draft.md` 或 `memory/BRIEFING.md` 是否存在，若不存在，請引導使用者先執行 `/teamwork-preview`。
2.  **轉換為 BRIEFING**：如果只有 `prompt_draft.md`，請將其內容複製/寫入到 `.agents/memory/BRIEFING.md`。
3.  **環境確認**：檢查 `.agents/core/package.json` 與 `delegation.ts` 是否存在。如果沒有安裝 `ts-node` 等依賴，請建議使用者執行 `npm install`。
4.  **啟動機制**：執行 `delegation.ts` 腳本 (例如透過 `npx tsx .agents/core/delegation.ts` 或對應的執行命令)。
5.  **進入監控模式**：告知使用者「Teamwork Orchestration 已啟動」，並可透過讀取 `.agents/memory/progress.log` 與 `plan.md` 監控進度。
6.  *備註*：在此環境中，Antigravity 將扮演觀測者，讓背景腳本驅動，或是在有支援 Agent 互動模式的情況下，主動以 Orchestrator 身份呼叫 Subagents (`invoke_subagent`)。
