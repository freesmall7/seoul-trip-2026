# Seoul Trip Editable

文件结构：
- public/index.html：旅行手册前端
- src/index.js：D1 API
- wrangler.jsonc：Cloudflare Worker / D1 配置
- schema/schema.sql：D1 建表 SQL

部署前：
1. 在 D1 Console 执行 schema/schema.sql
2. 在 Worker 的 Settings/Variables and Secrets 中添加 Secret：ADMIN_PASSWORD
3. 把本项目文件提交到 GitHub main 分支
