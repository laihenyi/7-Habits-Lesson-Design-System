# 7-Habits-Lesson-Design-System

## 教案設計系統（/tool）

`lesson-designer-standalone.html` 為單檔工具，內容原樣保存、不改動。網站的 `/tool` 路由會在回應時注入一小段 `window.claude.complete` 橋接，讓「AI 起草」呼叫 `/api/complete`（伺服器端轉送 Claude API）。

- 設定環境變數：複製 `.env.example` 為 `.env.local`，填入 `ANTHROPIC_API_KEY`（Vercel 請在專案設定加入）。
- `npm run dev` 後開啟 `/tool`。
- 未設定金鑰時，AI 起草會顯示錯誤，其餘功能照常。
- `/api/complete` 有簡易限流（每 IP 每分鐘 12 次）；正式對外前建議改用共用儲存的限流。
