# 7-Habits-Lesson-Design-System

## 教案設計系統（/tool）

`lesson-designer-standalone.html` 為單檔工具，內容原樣保存、不改動。網站的 `/tool` 路由會在回應時注入一小段 `window.claude.complete` 橋接，讓「AI 起草」呼叫 `/api/complete`（伺服器端轉送 Claude API）。

- 設定環境變數：複製 `.env.example` 為 `.env.local`，填入 `ANTHROPIC_API_KEY`（Vercel 請在專案設定加入）。
- `npm run dev` 後開啟 `/tool`。
- 未設定金鑰時，AI 起草會顯示錯誤，其餘功能照常。
- `/api/complete` 有簡易限流（每 IP 每分鐘 12 次）；正式對外前建議改用共用儲存的限流。

## 教案生成器的三個版本

原始碼在 `generator/`（`template.html`、`diagrams.js`、`worksheet.js`），執行 `python3 generator/build.py` 會產出：

| 檔案 | 用途 | AI 用誰的額度 |
|---|---|---|
| `lesson-generator.html` | 由 Claude Code 發佈成 artifact 連結 | 只有發佈者組織的成員拿得到內建 AI，其他人自動走手動模式 |
| `lesson-generator-chat.html` | 上傳到 claude.ai 聊天，請 Claude 原封不動建立成 artifact，再用聊天的「發佈」產生公開連結 | 打開連結的人自己的 Claude 帳號（免費或付費） |
| 同上，放到靜態網站 | 任何人用網址打開 | 沒有內建 AI，走手動模式（複製提示詞到任何 AI，再貼回） |

頁面啟動時依序尋找 AI：Claude Code artifact 的 `sample` → 聊天 artifact 的 `window.claude.complete` → 聊天 artifact 的免金鑰 Messages API → 手動模式。
