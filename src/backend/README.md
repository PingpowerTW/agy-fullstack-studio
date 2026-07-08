# Backend Development Standards

本目錄存放後端服務器程式碼（Node.js / NestJS / Express）。

---

## 🔒 安全與防護門禁 (Security Rules)

> [!IMPORTANT]
> - **Input 門禁**：所有傳入請求必須透過 DTO 進行嚴格型別校驗，禁止未經過濾的 Payload 直接流向 Service。
> - **防 SQL 注入**：嚴禁任何型態的 SQL 字串拼接（`SELECT ... WHERE name = '` + name + `'`）。必須使用參數化查詢（Prepared Statements）或 ORM 參數綁定。
> - **敏感資訊掩蔽**：嚴禁在 Exception 報錯中將原始資料庫 Error Message 直接回傳給前端。所有對外報錯必須是標準的 HTTP Error 結構。

---

## 🧱 代碼架構規範 (Code Architecture)
1. **分層架構 (Layered Architecture)**：
   - 遵守 `Controller -> Service -> Repository` 單向相依原則。
   - Controller 僅處理請求轉接與 DTO 校驗；Service 處理核心商業邏輯；Repository 專責數據存取。
2. **結構化日誌 (Structured Logging)**：
   - 日誌必須為低基數 (low-cardinality) 結構化 JSON。
   - 嚴禁在日誌中進行變數插值（例如使用 `logger.info("User " + id + " logged in")` ——改用 `logger.info({ userId: id }, "User logged in")`）。
3. **快取策略**：
   - 高頻讀取、低頻變動的資料（如系統參數、用戶設定）必須在服務端使用 Redis 進行快取，並設置明確的 TTL 機制。
