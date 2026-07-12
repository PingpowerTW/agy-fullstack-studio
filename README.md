# ⚡ agy-fullstack-studio
### 本地持久化全端開發 AI 工作室 · Local Persistent Full-Stack AI Developer Studio

---

## 🇹🇼 繁體中文（預設） · [English](./README_EN.md)

### 導覽
[1. 專案總覽](#1-專案總覽與核心價值) · 
[2. 核心功能](#2-核心功能與能力說明) · 
[3. 目錄結構](#3-儲存庫目錄結構) · 
[4. AI 代理人團隊分工](#4-ai-代理人團隊分工) · 
[5. 自動化門禁](#5-自動化驗證門禁) · 
[6. 安裝與快速入門](#6-安裝與快速入門) · 
[7. 實戰開發工作流](#7-實戰開發工作流) · 
[8. 測試驗證](#8-測試驗證) · 
[9. 授權條款](#9-授權條款)

---

## 1. 專案總覽與核心價值

在單純依賴 AI 進行程式碼開發時，缺乏結構的對話往往會導致專案架構迅速腐爛：硬編碼的 Magic Numbers、缺漏的 DTO 驗證、雜亂無章的資料庫 SQL 拼接、沒有單元測試的裸奔程式碼。

`agy-fullstack-studio` 是一個專為 **Antigravity (AGY) 平台** 設計的**生產級全端應用開發工作室**。它不再依賴脆弱的傳統 Node.js 排程腳本，而是直接昇華為 **AI 原生技能 (Skill)**。只要一句 `/agy` 指令，就能在聊天視窗中召喚一組訓練有素的虛擬全端團隊，為您自動化完成「資料庫設計 → 後端 API 開發 → 前端介面串接 → 程式碼審核」的完整開發流。

### 為什麼使用本工作室？

| 現有 AI 開發的問題 | 傳統 Node.js 腳本方案的缺陷 | AGY Full-Stack Studio 的解法 |
| :--- | :--- | :--- |
| **代碼腐爛與混亂** | 缺乏架構思維，單一 Prompt 容易迷失 | **專屬 AI 團隊**：分工為 DB, Backend, Frontend 獨立處理 |
| **維護成本極高** | 需親自處理 API 限流、斷線重連與型別衝突 | **Zero-Setup Skill**：無須維護程式碼，一切由 AI 底層直接驅動 |
| **機密變數洩漏** | 手動寫入 `.env` 或 Hardcoded API Key 提交 | **validate-secrets** 門禁：靜態掃描阻擋 Secrets 外洩 |
| **AI 幻覺與語法錯誤**| 程式崩潰時無法自動修正 | **QA Auditor 審核**：AI 會自行看懂報錯，自動退回重新開發 (最多 2 輪迭代) |

---

## 2. 核心功能與能力說明

### 🤖 內建 AI 技能：`/agy` 全端團隊指令
本專案的核心在於直接整合至您的 Antigravity 大腦中。當您使用 `/agy` 指令時，我 (AI 助理) 將化身為總經理 (Orchestrator)，並在背景動態召喚 4 大專職子代理人進行平行開發。

### 🛡️ 實體檔案與防禦性門禁
子代理人產出的代碼不會只停留在對話框，Orchestrator 會在通過審核後，真實地寫入本專案目錄。同時配合自動化 Hooks (機密掃描、資料庫 Schema 驗證)，確保產出的代碼完全符合生產標準。

---

## 3. 儲存庫目錄結構

```
agy-fullstack-studio/
│
├── 📄 AGENTS.md                    # 本專案主控制設定與全局 Rules
├── 📄 README.md                    # 本文件
│
├── 📁 .agents/                     # Antigravity 專案自訂目錄
│   ├── 📄 settings.json            # 權限、安全與 hooks 載入規則
│   │
│   ├── 📁 skills/                  
│   │   └── 📁 agy-studio/          
│   │       └── 📄 SKILL.md         # 核心 AI 技能定義檔 (供系統載入)
│   │
│   ├── 📁 hooks/                   # 自動化校驗 Hooks 腳本
│   │   ├── validate-secrets.js     #   機密掃描器核心
│   │   └── validate-db-migrations.js#  資料庫遷移校驗器核心
│   │
│   └── 📁 docs/
│       └── templates/              # 工程文件模板
│
└── 📁 workspace/                   # AI 團隊自動產出代碼的實際位置
    ├── 📁 frontend/                # Frontend Master 的產出區域
    ├── 📁 backend/                 # Backend Lead 的產出區域
    └── 📁 database/                # DB Architect 的產出區域
```

---

## 4. AI 代理人團隊分工

當您輸入 `/agy` 後，以下團隊將自動開始運作：

1.  **Orchestrator (主代理人)**：理解您的需求，拆解開發里程碑 (Milestones)，並負責最後的實體檔案寫入。
2.  **DB Architect (資料庫架構師)**：專門負責設計資料庫 Schema，確保關聯正確、正規化與索引設計最佳化。產出 SQL 腳本。
3.  **Backend Lead (後端主導者)**：根據 DB 規格，撰寫 Node.js/Express 程式碼，設計 RESTful APIs 與處理業務邏輯。
4.  **Frontend Master (前端大師)**：根據 API 規格，刻畫現代化 UI/UX 介面 (如 React/Tailwind 等)，並實作串接邏輯。
5.  **QA Auditor (測試審核員)**：對照前後端代碼，進行漏洞檢查與邊界條件 (Edge cases) 測試。若發現錯誤會直接 Reject 並退回修改。

---

## 5. 自動化驗證門禁

本專案配置的 Hooks 會在特定編輯與 Git 操作時自動執行，確保任何違規代碼無法進入專案：

*   **validate-secrets**：使用特徵 Regex 與熵值分析，動態檢測程式碼中是否包含敏感金鑰與連線帳密，防止機密洩漏。
*   **validate-db-migrations**：強制所有 DB Schema 變更必須符合命名規範，拒絕破壞性 DDL。

---

## 6. 安裝與快速入門

### 1. 載入 AI 技能
為了讓您的 AI 系統認識 `/agy` 指令，請將本專案內的技能定義檔複製到您的全域設定中：
```bash
# Windows 用戶請複製到對應的 .gemini 目錄
cp -r .agents/skills/agy-studio ~/.gemini/config/skills/
```

### 2. 啟動全端團隊
在對話框中直接對 AI 說：
> `/agy 幫我寫一個完整的待辦事項網頁，包含前端介面、後端 API 與資料庫設計`

AI 就會自動化身為開發團隊，幫您將程式碼寫入 `workspace/` 目錄下！

---

## 7. 實戰開發工作流

1. **需求下達**：使用 `/agy` 指令並描述您的專案。
2. **AI 自動開會**：您會看到 Orchestrator 開始分配任務，DB、Backend、Frontend 開始依序產出規格。
3. **QA 審核攔截**：如果 API 對接有誤，Auditor 會自動攔截並要求重新修改。
4. **驗收成果**：審核通過後，所有檔案將自動生成於您的專案目錄，您可以直接執行測試！

---

## 8. 測試驗證

您可以隨時手動執行本專案附帶的自動化門禁來驗證本地代碼：

```bash
# 測試機密掃描器
node .agents/hooks/validate-secrets.js workspace/backend/api.js
```

---

## 9. 授權條款

本專案採用 **MIT 授權條款** 釋出。詳細內容請參閱 [LICENSE](./LICENSE) 檔案。
