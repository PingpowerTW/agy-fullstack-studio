---
name: security-audit
description: 全端靜態安全審查。檢測代碼中的 SQL 注入、XSS、認證缺失漏洞，並對第三方套件進行漏洞審計。
---

# Skill: /security-audit (安全稽核與相依審計)

此指令用於執行全端應用靜態程式碼安全分析 (SAST) 與依賴庫審計，確保系統沒有顯著的 CVE 漏洞與常見的安全編碼盲點。

## When to Use
- 在每次提交大的 PR 之前，或者是 Sprint 結束準備發佈時。
- 專案依賴套件升級時。

## 執行邏輯與流程 (Workflow)
當使用者輸入 `/security-audit` 時：
1. **代碼靜態掃描**：
   - 掃描後端代碼，確認沒有使用字串拼接 SQL (SQL 注入漏洞)。
   - 檢查前端程式碼，確認沒有使用未經過濾的安全 HTML (XSS 漏洞)。
   - 檢查密鑰與敏感變數，確認沒有將明文 Secrets 提交在代碼中。
2. **依賴庫漏洞審查**：
   - 執行 `npm audit` 或是使用 Snyk/pip audit 工具，對前後端的 `package.json` 或 `requirements.txt` 相依性進行分析。
3. **認證與傳輸查核**：
   - 檢查 JWT / Cookie 的配置是否包含 `HttpOnly`, `Secure` 與 `SameSite` 屬性。
   - 確認所有的敏感 API 是否具備身份驗證 (Auth Guards) 門禁。
4. **輸出安全報告**：
   - 輸出安全性等級報告（高危、中危、低危）。
   - 若發現高危（Critical/High Risk）漏洞，將會發出 Warning，並提供對應的修補（Patch）方案。
