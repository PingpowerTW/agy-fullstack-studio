# Antigravity Full-Stack Developer Studio — 技術債與安全漏洞審計報告

本報告針對 **Antigravity Full-Stack Developer Studio** 的核心代理人協調代碼（`.agents/core/delegation.ts`）、設定配置（`.agents/settings.json`）及三個驗證門禁腳本（`.agents/hooks/`）進行了全面的技術債與安全漏洞審計。

---

## 1. 審計概要

本專案共識別出 **15 項** 技術債與安全性漏洞，其中高危（🔴 Critical）4 項、中危（🟡 Medium）7 項、低危（🟢 Low）4 項。

### 嚴重程度分佈與分類
*   **🔴 高危 (Critical)**：直接威脅系統穩定度、沙盒防禦有效性、或是會導致敏感資訊無聲洩漏、安全門戶大開（Fail-Open）的漏洞。
*   **🟡 中危 (Medium)**：會導致業務邏輯失效（如硬編碼）、功能受限（如不支援非 SQL 的 Migration）、或是在開發過程中引起高機率誤報/漏報（False Positives/Negatives）進而干擾工作流的項目。
*   **🟢 低危 (Low)**：屬於系統觀測性不足、過度簡化或跨平台相容性（如 Windows 環境不支援 Shell 腳本）等優化項目。

---

## 2. 技術債與安全漏洞清單

### D001: MessageBus 同步事件發送未隔離監聽器異常
*   **嚴重等級**：🔴 Critical
*   **相對位置**：`.agents/core/delegation.ts` Line 59-60
*   **問題描述**：Node.js 的 `EventEmitter.emit` 預設是**同步**執行的。當 `MessageBus` 分派事件給特定 Agent（如 `Orchestrator`）時，若 Agent 內部的監聽器拋出執行期異常（例如未處理的 JSON 解析錯誤、型別錯誤或空值存取），此錯誤會直接向上擊穿，導致整個 `MessageBus` 進程崩潰。
*   **根本原因**：在呼叫 `this.emit` 發送事件時，沒有使用 `try-catch` 包裹各個監聽器的調用。
*   **業務影響**：任何單一 Agent 的小錯誤都會直接中斷整個虛擬工作室的運作，缺乏容錯與崩潰隔離機制。
*   **修復方案**：在事件發送時，將 emit 行為移入 try-catch 塊中，確保單一 Agent 的崩潰不會影響整個 MessageBus。

### D002: settings.json 敏感指令黑名單極易被繞過
*   **嚴重等級**：🔴 Critical
*   **相對位置**：`.agents/settings.json` Line 13-17
*   **問題描述**：系統使用靜態字串比對來阻擋 `cat .env` 等指令。在 Windows 環境下，開發者只需使用 `type .env`、`powershell Get-Content .env` 或是用 `less .env`，即可輕易讀取機密。此外，`rm -rf /` 在 Windows 上本就無效，無法阻止 Windows 特有的破壞指令（如 `Remove-Item`）。
*   **根本原因**：採用靜態黑名單過濾指令，而非使用正規沙盒化（Sandbox）或基於語法樹分析的安全門禁。
*   **業務影響**：惡意或受損的 Agent 可以輕易繞過黑名單讀取系統機密，防禦機制流於形式。
*   **修復方案**：改用基於參數解析與正則表達式的動態匹配，或是在執行端限制可調用的二進位檔案白名單。

### D003: validate-secrets.js 通用 API Key 正則過度約束引號，導致無引號的洩漏無法攔截
*   **嚴重等級**：🔴 Critical
*   **相對位置**：`.agents/hooks/validate-secrets.js` Line 6
*   **問題描述**：通用 API Key 正則過度依賴引號字面量（例如強制要求 `key = 'value'` 格式中的引號）。在 `.env` 或 YAML 配置中，鍵值通常不需要被引號包裹（例如 `API_KEY=AIzaSyA1B2C3D4...`），此時該正則完全失效。此外，資料庫連線正則僅比對 PostgreSQL，忽略了 MySQL、MongoDB、Redis 等其他常用資料庫。
*   **根本原因**：Regex 寫死要求單/雙引號匹配，且未將其他常用資料庫協定納入檢測。
*   **業務影響**：寫在環境變數或 YAML 檔案中的明文機密會被無聲放行並提交至代碼庫中，造成重大安全隱患。
*   **修復方案**：重構正則表達式，支持選配引號匹配，並擴展資料庫連線協定匹配。

### D004: 驗證 Hooks 在檔案讀取/執行異常時 Fail-Open 吞沒錯誤
*   **嚴重等級**：🔴 Critical
*   **相對位置**：所有的驗證 Hooks 檔案 (`.agents/hooks/validate-*.js`)
*   **問題描述**：當 `fs.readFileSync` 因為檔案不存在、權限不足或檔案被鎖定而拋出錯誤時，`catch` 區塊皆是空的，且方法預設回傳 `true`（通過驗證）。
*   **根本原因**：不安全的異常處理設計。當發生錯誤時，預設回傳 `true`（Fail-Open）。
*   **業務影響**：一旦發生系統讀取異常，所有門禁機制將完全被繞過，損壞或不合規的檔案會直接進入程式庫。
*   **修復方案**：將 `catch` 中的行為重構為回傳 `false`（Fail-Closed），並列印詳細錯誤日誌。

### D005: Orchestrator 規劃邏輯完全硬編碼，忽略 `userRequest` 輸入
*   **嚴重等級**：🟡 Medium
*   **相對位置**：`.agents/core/delegation.ts` Line 142-157
*   **問題描述**：雖然 `Sentinel.boot()` 接收了來自使用者的 `userRequest` 參數，但 `Orchestrator` 的 `createPlan()` 方法完全忽略了 Briefing 的實際語意，直接在代碼中寫死 Milestone 1 及 Task `t1_1`。
*   **根本原因**：未對 `BRIEFING.md` 進行實質解析，僅做靜態流程模擬。
*   **業務影響**：系統不具備真正的動態任務規劃與拆解能力，無法處理真實的多樣化使用者需求。
*   **修復方案**：引入 Markdown 解析器或串接 LLM，根據 `BRIEFING.md` 內容動態生成 Milestone 與 Task 陣列。

### D006: Auditor 驗證完全 Mock 繞過，靜態回傳 `passed: true`
*   **嚴重等級**：🟡 Medium
*   **相對位置**：`.agents/core/delegation.ts` Line 347
*   **問題描述**：`Auditor` 在收到稽核請求後，僅透過 `setTimeout` 延遲 1500ms，便直接回傳寫死的 `passed: true`，沒有對工作目錄進行任何實質檢查。
*   **根本原因**：稽核邏輯為 Mock 實作。
*   **業務影響**：即使 Worker 交付了損壞、無法編譯或安全性不合規的程式碼，Auditor 也會直接放行，讓 CI/CD 門禁失去意義。
*   **修復方案**：在 Auditor 中實作檔案存在性檢查、呼叫測試指令與靜態分析工具，並將結果動態回報。

### D007: validate-secrets.js 通用機密正則過寬導致誤判正常測試/開發設定
*   **嚴重等級**：🟡 Medium
*   **相對位置**：`.agents/hooks/validate-secrets.js` Line 6
*   **問題描述**：通用 API Key 正則過於寬鬆，只要變數名稱包含 key/secret/token 且值長度大於 16，就會觸發攔截。這會導致正常的開發設定（如 `jwt_secret = "development_secret_key_string"`）或測試用 mock token 被阻擋。
*   **根本原因**：沒有過濾機制與上下文上下文排除規則。
*   **業務影響**：造成大量的誤報（False Positives），阻礙正常代碼的 Commit 與開發流程。
*   **修復方案**：優化正則的熵值（Entropy）檢測，或在設定檔中提供路徑白名單/排除註解。

### D008: validate-api-schema.js 粗糙的花括號計數驗證，未排除註解、字串與正則
*   **嚴重等級**：🟡 Medium
*   **相對位置**：`.agents/hooks/validate-api-schema.js` Line 22-26
*   **問題描述**：腳本僅用 `content.match(/\{/g)` 來計算大括號數量。如果代碼註解中包含括號說明（如 `// {`）、字串字面量中包含大括號，或是正則表達式中有量詞（如 `/[a-z]{2,4}/`），就會因為左右括號數量不對等而驗證失敗。
*   **根本原因**：使用最基礎的正則計數，而非使用語法分析器（Parser）或編譯器來檢測語法。
*   **業務影響**：導致無意義的誤報，阻礙正常的 TS 代碼提交。
*   **修復方案**：改用真正的 JavaScript/TypeScript Parser（如 `acorn` 或是 Node 自帶的 `vm.Script` 語法檢查）進行結構校驗。

### D009: validate-api-schema.js YAML 語法驗證流於形式，僅用 `includes` 判定
*   **嚴重等級**：🟡 Medium
*   **相對位置**：`.agents/hooks/validate-api-schema.js` Line 12-19
*   **問題描述**：對於 YAML 檔案，腳本只檢查是否包含 `openapi:` 與 `paths:` 字串。即使 YAML 的格式嚴重破損（例如縮排錯誤、非法字元），只要含有該關鍵字即可通過檢查。
*   **根本原因**：未對 YAML 內容進行實質的反序列化（Parse）操作。
*   **業務影響**：語法錯誤的 API 契約檔案會被放行，導致後續前端與後端代碼生成出錯。
*   **修復方案**：引入 `yaml` 解析器，將讀取內容進行 `yaml.parse(content)`，若拋出異常則判定為不合規。

### D010: validate-db-migrations.js 脆弱的 Migration Up/Down 偵測，使用 `includes` 字串匹配導致誤判
*   **嚴重等級**：🟡 Medium
*   **相對位置**：`.agents/hooks/validate-db-migrations.js` Line 16-21
*   **問題描述**：腳本使用 `content.includes('up')` 偵測是否包含 Up 機制。這會使得當 SQL 中包含單字如 `update`、`group`、`backup`、`setup` 等時，被誤判定為已實作 `Up` 邏輯。同理，`markdown` 或 `download` 會被誤判為已實作 `Down` 邏輯。這代表即使 Migration 檔案完全沒有實作 Down (Rollback) 邏輯，也能繞過驗證。
*   **根本原因**：未使用單字邊界正則或 SQL 註解結構匹配。
*   **業務影響**：不具備 Rollback 能力的 SQL 檔案被提交，若發生部署故障將無法進行資料庫復原，面臨資料丟失風險。
*   **修復方案**：改用包含單字邊界與註解樣式匹配的正則（如 `/\bup\b/i` 或 `/--\s*@migrate\s+up/i`）。

### D011: validate-db-migrations.js 限制 Migration 必須為 `.sql`，阻礙 JS/TS Migration 檔案
*   **嚴重等級**：🟡 Medium
*   **相對位置**：`.agents/hooks/validate-db-migrations.js` Line 10
*   **問題描述**：檔案命名規則強制限定字尾必須是 `.sql`。如果專案未來採用如 Knex, TypeORM 等使用 JavaScript 或 TypeScript 編寫 Migration 的庫，會被直接判定不合規。
*   **根本原因**：正則 `/^\d{8}.*\.sql$/` 寫死副檔名。
*   **業務影響**：限制了資料庫技術選型，阻礙了採用程式化 Migration 的擴展性。
*   **修復方案**：放寬正則以支援 `.sql`、`.js`、`.ts` 等多種副檔名。

### D012: MessageBus 中 Heartbeat 發送給不存在的 `All` 接收者，導致廣播丟失
*   **嚴重等級**：🟢 Low
*   **相對位置**：`.agents/core/delegation.ts` Line 91, 199, 335
*   **問題描述**：MessageBus 以 `recipient` 欄位作為事件名稱發送事件，但系統內沒有任何 Agent 訂閱 `All` 事件。因此，所有 `recipient: 'All'` 的廣播訊息（如 Heartbeat 訊息）在運行時均默默遺失，沒有被任何代理人接收。
*   **根本原因**：MessageBus 缺乏廣播事件的分發映射邏輯。
*   **業務影響**：降低了系統的可觀測性，Agent 無法感知全域事件與其他角色的存活狀態。
*   **修復方案**：在 MessageBus 中，當 recipient 為 'All' 時，循環發送給所有已註冊的 Agent 角色。

### D013: delegation.ts 中硬編碼的 5 秒 Session 結束時間，易因超時產生 Race condition
*   **嚴重等級**：🟢 Low
*   **相對位置**：`.agents/core/delegation.ts` Line 368-371
*   **問題描述**：整個協調流程生命週期是由最底層的主流程 `setTimeout(..., 5000)` 強性關閉。如果未來任務數量增加、或 Worker 執行耗時超過 5 秒，則 MessageBus 會在流程中段被強行關閉，造成狀態不一致。
*   **根本原因**：沒有基於事件驅動（Event-driven）或狀態機完成信號來結束 Session，而是使用硬編碼定時器。
*   **業務影響**：在高負載或慢速磁碟下，任務極易因為超時被強行中斷，產生嚴重的 Race Condition。
*   **修復方案**：當 Orchestrator 宣告 Victory 或 Failure 時，發送對應的事件通知主流程關閉 MessageBus。

### D014: delegation.ts 中重複的 Message ID，多任務並行時日誌追蹤與消重失效
*   **嚴重等級**：🟢 Low
*   **相對位置**：`.agents/core/delegation.ts` Line 309, 343
*   **問題描述**：`BackendWorker` 與 `Auditor` 發送回報時，其 Message ID 被寫死為靜態字串（如 `be_rep_1`, `au_res`）。
*   **根本原因**：未使用 UUID 或動態遞增計數器。
*   **業務影響**：如果有多個任務並行，所有回報訊息將會使用相同的 ID，導致日誌去重（Deduplication）與精準追蹤機制失效。
*   **修復方案**：在發送 Message 時，使用動態生成（如 `crypto.randomUUID()`）的 ID。

### D015: settings.json 中 Hook 指向 `.sh` 檔案，在 Windows 環境下無法直接原生執行
*   **嚴重等級**：🟢 Low
*   **相對位置**：`.agents/settings.json` Line 24, 33, 38
*   **問題描述**：`settings.json` 中的 `script` 全部指向 Unix shell 檔案（`.agents/hooks/*.sh`）。在標準的 Windows 環境（若未使用 Git Bash）下，系統無法原生執行 shell 腳本，會導致 Hook 啟動失敗或完全失效。
*   **根本原因**：Hooks 機制綁定特定的作業系統 Shell。
*   **業務影響**：Windows 開發者無法正常執行門禁，或是在修改代碼時頻繁出錯。
*   **修復方案**：在 Hook 呼叫時，改為使用 `node .agents/hooks/validate-*.js` 直接執行 cross-platform 的 Node.js 腳本，避免經過 Shell 轉接。

---

## 3. 核心代碼重構方案 (Code Refactoring Diffs)

以下針對 15 項技術債中影響安全與穩定性最深的三個模組提供具體的重構代碼。

### 3.1 MessageBus 異常隔離與廣播機制修復 (D001 & D012)
此重構為事件分發加入 `try-catch` 異常隔離，防止單一 Agent 異常擊穿系統，並實作了 `All` 廣播對應。

```diff
--- .agents/core/delegation.ts (Original)
+++ .agents/core/delegation.ts (Refactored)
@@ -49,12 +49,30 @@
   publish(msg: Message) {
     const logLine = `[${msg.timestamp}] [${msg.sender} ──► ${msg.recipient}] (${msg.type}): ${JSON.stringify(msg.payload)}\n`;
-    this.logStream.write(logLine);
+    try {
+      this.logStream.write(logLine);
+    } catch (err) {
+      console.error(`[MessageBus Log Error] Failed to write log line:`, err);
+    }
     
     // Pretty print to console with styling
     const color = this.getAgentColor(msg.sender);
     const reset = '\x1b[0m';
     console.log(`${color}[${msg.sender} ──► ${msg.recipient}]${reset} (${msg.type})`);
     console.log(`  └─► ${typeof msg.payload === 'string' ? msg.payload : JSON.stringify(msg.payload, null, 2).replace(/\n/g, '\n  ')}`);
     
-    this.emit(msg.recipient, msg);
-    this.emit('message', msg);
+    const dispatchToAgent = (recipientName: string) => {
+      try {
+        this.emit(recipientName, msg);
+      } catch (err) {
+        console.error(`[ERROR] Exception thrown in listener for recipient '${recipientName}':`, err);
+      }
+    };
+
+    if (msg.recipient === 'All') {
+      const activeAgents = ['Sentinel', 'Orchestrator', 'DatabaseWorker', 'BackendWorker', 'FrontendWorker', 'Auditor'];
+      activeAgents.forEach(agent => dispatchToAgent(agent));
+    } else {
+      dispatchToAgent(msg.recipient);
+    }
+
+    try {
+      this.emit('message', msg);
+    } catch (err) {
+      console.error(`[ERROR] Exception in global 'message' listener:`, err);
+    }
   }
```

### 3.2 Secrets Scan 漏報修正與安全門禁 Fail-Closed 重構 (D003 & D004)
此重構優化了 API Key 正則，納入無引號情況並擴展了資料庫連線協定匹配。同時，對二進位檔案進行排除，且在檔案讀取異常時落實 Fail-Closed 設計。

```diff
--- .agents/hooks/validate-secrets.js (Original)
+++ .agents/hooks/validate-secrets.js (Refactored)
@@ -5,8 +5,8 @@
 const rules = [
-  { name: 'API Key (Generic)', regex: /(key|api_key|apikey|secret|token)\s*[:=]\s*['"][a-zA-Z0-9_\-]{16,}['"]/i },
-  { name: 'OpenAI API Key', regex: /sk-[a-zA-Z0-9]{48}/ },
+  { name: 'API Key (Generic)', regex: /(key|api_key|apikey|secret|token)\s*[:=]\s*(['"]?)[a-zA-Z0-9_\-]{16,}\2/i },
+  { name: 'OpenAI API Key', regex: /sk-(proj-)?[a-zA-Z0-9]{40,}/ },
   { name: 'Google API Key', regex: /AIzaSy[a-zA-Z0-9_\-]{33}/ },
-  { name: 'Database Password URL', regex: /postgres(ql)?:\/\/.*:[^@]+@/i }
+  { name: 'Database Password URL', regex: /(postgres(ql)?|mysql|mongodb|redis):\/\/.*:[^@]+@/i }
 ];
 
 function scanFile(filePath) {
@@ -19,2 +19,8 @@
     if (filePath.includes('.git') || filePath.includes('node_modules') || basename === 'validate-secrets.js') {
       return true;
     }
+
+    const binaryExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.pdf', '.zip', '.tar', '.gz', '.exe', '.dll', '.ico'];
+    if (binaryExtensions.includes(path.extname(filePath).toLowerCase())) {
+      return true;
+    }
 
@@ -29,5 +35,6 @@
   } catch (err) {
-    // 忽略讀取錯誤
+    console.error(`[SECURITY ERROR] Failed to read/scan file ${filePath}: ${err.message}`);
+    return false; // Fail-Closed: 讀取失敗時視為不通過，防止安全門戶大開
   }
-  return true;
+  return true;
 }
```

### 3.3 DB Migration 邊界 Regex 強化與 Fail-Closed 重構 (D004 & D010 & D011)
此重構擴展了 Migration 檔案支援範圍（`.sql`、`.js`、`.ts`），並使用單字邊界 `\b` 正則來精準定位 `up` 與 `down` 機制，避免被 normal 單字誤導，同時在異常時實作 Fail-Closed。

```diff
--- .agents/hooks/validate-db-migrations.js (Original)
+++ .agents/hooks/validate-db-migrations.js (Refactored)
@@ -9,12 +9,12 @@
     // 檢查命名是否符合時間戳前綴 YYYYMMDD
-    if (!/^\d{8}.*\.sql$/.test(basename)) {
-      console.error(`[MIGRATION ERROR] Migration file name '${basename}' must start with 8-digit date prefix (YYYYMMDD...).`);
+    if (!/^\d{8}.*\.(sql|js|ts)$/.test(basename)) {
+      console.error(`[MIGRATION ERROR] Migration file name '${basename}' must start with 8-digit date prefix (YYYYMMDD...) and end with .sql, .js, or .ts.`);
       return false;
     }
 
-    // 檢查是否同時包含 Up 與 Down 指示字眼 (例如 golang-migrate 或者是 db-migrate 等慣用註解)
-    const hasUp = content.includes('Up') || content.includes('up') || content.includes('UP');
-    const hasDown = content.includes('Down') || content.includes('down') || content.includes('DOWN');
+    // 使用正則邊界或明確註解結構，防止單字內含匹配 (如 update, markdown)
+    const hasUp = /\bup\b/i.test(content) || /@migrate\s+up/i.test(content);
+    const hasDown = /\bdown\b/i.test(content) || /@migrate\s+down/i.test(content);
 
     if (!hasUp || !hasDown) {
-      console.error(`[MIGRATION ERROR] Migration file ${filePath} must contain both 'Up' (upgrade) and 'Down' (rollback) scripts.`);
+      console.error(`[MIGRATION ERROR] Migration file ${filePath} must contain explicit rollback/upgrade boundaries or comments containing 'up' and 'down'.`);
       return false;
     }
   } catch (err) {
-    // 忽略讀取錯誤
+    console.error(`[MIGRATION ERROR] Failed to read migration file ${filePath}: ${err.message}`);
+    return false; // Fail-Closed: 讀取出錯時攔截提交
   }
-  return true;
+  return true;
 }
```

---

## 4. 驗證與測試計畫

為了確認上述重構的正確性，本計畫提供了具體的黑箱與白箱測試步驟。

### 4.1 測試 D001 (MessageBus 異常隔離與 All 廣播)
1.  **測試案例 1：All 廣播**
    *   **步驟**：修改 `.agents/core/delegation.ts` 中的 `Sentinel` 發送 `HEARTBEAT` 給 `All` 的邏輯。
    *   **預期行為**：MessageBus 將事件分發給 `Sentinel`、`Orchestrator`、`BackendWorker`、`Auditor`，控制台輸出對應的所有接收者日誌。
2.  **測試案例 2：事件監聽器崩潰隔離**
    *   **步驟**：在 `Orchestrator` 監聽器中人為加入錯誤（例如 `throw new Error("Mock Orchestrator Crash");`）。
    *   **預期行為**：控制台印出錯誤日誌 `[ERROR] Exception thrown in listener...`，但系統**不會崩潰**，其餘 Agent（如 `BackendWorker`）仍可照常接收訊息，Session 正常結束。

### 4.2 測試 D003 & D004 (Secrets 掃描防護)
1.  **測試案例 1：無引號 Secrets 阻擋**
    *   **步驟**：建立 `src/test_secret.env`，寫入無引號的 Google API Key：
        ```env
        MY_KEY=AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6
        ```
    *   **執行命令**：`node .agents/hooks/validate-secrets.js src/test_secret.env`
    *   **預期行為**：輸出 `[SECURITY ERROR] Found potential Google API Key in...`，退出碼為 `1`，成功阻擋。
2.  **測試案例 2：二進位檔案排除與 Fail-Closed**
    *   **步驟**：測試掃描一張圖片檔案 `src/logo.png`，以及掃描一個不存在的檔案 `nonexistent.js`。
    *   **預期行為**：
        *   `logo.png`：自動跳過，輸出 `Secrets scan passed.`（Exit Code 0）。
        *   `nonexistent.js`：輸出 `Failed to read/scan file nonexistent.js...`，退出碼為 `1`，成功落實 Fail-Closed。

### 4.3 測試 D010 & D011 (Migration 門禁)
1.  **測試案例 1：JS/TS Migration 支援**
    *   **步驟**：建立 `src/db/migrations/20260711_init.js`，內容如下：
        ```javascript
        exports.up = function(knex) { return knex.schema.createTable('users'); };
        exports.down = function(knex) { return knex.schema.dropTable('users'); };
        ```
    *   **執行命令**：`node .agents/hooks/validate-db-migrations.js src/db/migrations/20260711_init.js`
    *   **預期行為**：輸出 `DB Migration validation passed.`，代表成功放行 JS 遷移檔。
2.  **測試案例 2：Up/Down 偽裝攔截**
    *   **步驟**：建立不合規 SQL 檔案，其中只有 `CREATE` 與 `UPDATE` 語句，無 Down 還原邏輯：
        ```sql
        -- This file updates database configuration
        CREATE TABLE dummy (id INT);
        ```
    *   **執行命令**：`node .agents/hooks/validate-db-migrations.js src/db/migrations/20260711_dummy.sql`
    *   **預期行為**：輸出 `[MIGRATION ERROR] Migration file... must contain explicit rollback/upgrade boundaries...`，且退出碼為 `1`。成功識破 `update` 單字，阻擋無 Down 邏輯的 SQL。
