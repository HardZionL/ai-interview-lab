# ai-interview-lab
自用面试学习打卡

---

# AI Interview Studio · Art Edition

一个完全静态的 AI 工程面试学习网页，包含 21 天 / 105 题学习路径。所有学习进度、口述稿、自评记录保存于使用者当前浏览器的 localStorage，而非 GitHub 仓库。

## 发布到 GitHub Pages

1. 在 GitHub 新建专用仓库，建议名称 `ai-interview-lab`，不要复用其他业务项目。
2. 将本文件夹内的 `index.html`、`.nojekyll`、`.gitignore`、`README.md`、`PRIVACY.md` 提交至仓库 `main` 分支根目录。
3. 在仓库 `Settings → Pages → Build and deployment` 中选择 `Deploy from a branch`，`main` 与 `/(root)`，然后保存。
4. Pages 发布成功后，使用仓库设置页实际提供的 `Visit site` 地址访问。

## 使用说明

- 同一浏览器、同一站点域名可保留学习记录。由本地 HTML 改为 Pages 域名后，需要先在旧版页面导出 JSON，再在新站导入。
- GitHub Pages 是静态托管平台，**不会自动将学习记录跨设备同步**，也不是 AI 模型语义评分服务。
- 网页不需要任何 API Key，请勿向仓库提交 `.env`、Tokens、学习记录或私密附件。
- 若未来加入 LLM API，请使用后端与服务器端密钥管理，**不能将密钥写进可公开访问的 HTML/JS**。
- 每天解锁内容按本地日期计算，起始日 2026-10-17。新题内容目前预置于静态页面，不会从源网站自动更新。