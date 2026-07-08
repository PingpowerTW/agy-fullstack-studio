# Frontend Development Standards

本目錄存放前端 Next.js / React 應用程式碼。

---

## 🎨 視覺與美感規範 (Aesthetics Rules)

> [!IMPORTANT]
> **Anti-AI-Slop 門禁（7 P0 Cardinal Sins）**：
> - 禁用 Tailwind `indigo` (#6366f1, #4f46e5) 與紫色系作為默認 accent。
> - 禁用紫→藍、藍→青等「常見 AI 漸層色」hero 區塊。
> - 禁用 `✨🚀🎯⚡🔥💡` 等多餘 Emoji 作為按鈕與標題裝飾——改用精細的微 stroke SVG。
> - 禁止使用圓角卡片配上左側彩色 border 作為亮點。
> - 所有 Display 文字（48px+）必須設定負 tracking（字距）。
> - 所有的 ALL CAPS 標題必須設定 `letter-spacing >= 0.06em`。

---

## 🛠️ UI/UX 專家級技能調用 (Core Skills Integration)
在進行視覺打磨或代碼重構時，必須主動參考與導入以下專屬技能：
- **`design-taste-frontend`**：調整字體字重、行高與間距比例，使設計呈現真人設計師手感。
- **`emil-design-eng`**：當開發轉場、微動效與動畫時，參考 Emil Kowalski 的 CSS easing 阻尼曲線。
- **`impeccable`**：在交付前執行 `/polish` 與 `/critique`，依據「產品」或「品牌」模式稽核 UI 完整度。
- **`web-design-guidelines`**：稽核對比度是否符合 WCAG 2.1 AA 標準，並確保點擊物件具備明確的 hover 態。

---

## 🧱 狀態與架構 (State & Architecture)
1. **邏輯分離 (MVC/Controller Pattern)**：
   - 嚴禁在 UI Component 內直接進行異步 fetch。所有 API 請求必須搬到 hooks/services 中。
2. **State Management**：
   - 區分 Local State (useState) 與 Global Store (Zustand/Redux)。
   - 禁止在全域 store 中存放頻繁變動的臨時組件狀態。
