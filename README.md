# 2026 天津马拉松 sub 2:55 训练计划

基于 4 场全马 FIT 数据深度分析定制的 22 周个性化训练计划,纯静态网页,可部署到 GitHub Pages。

## 在线预览

部署后访问: `https://<你的用户名>.github.io/2026-tianjin-marathon/`

## 重要提示

**比赛日期 2026-10-25 为推测值**(基于 2024-10-19 与 2025-10-25 规律)。官方公告出来后,请修改 `data.js`:

```javascript
const RACE_DAY = new Date('2026-10-25T07:30:00+08:00');  // 改为官方日期
```

整个项目的倒计时、关键节点、减量期日期都通过 `RACE_DAY` 自动计算,改一个值即可同步。

## 功能特性

### 交互
- **本周聚焦**: 自动识别当前是第几周,顶部高亮当周 6 天清单
- **完成勾选**: 每天点击标记完成,数据存于浏览器 localStorage,刷新不丢
- **整周勾选**: 表格中点击 ○ 标记整周完成
- **详情弹窗**: 点击任意周看每日详细训练
- **进度统计**: 顶部显示距比赛天数 / 当前周次 / 完成天数 / 训练周期进度

### 工具
- **配速计算器**: 输入目标全马时间,自动算 E/M/T/I/R 各强度区间配速
- **训练日志**: 记录每周主课 (周三质量课 + 周日长跑) 的 RPE / 感受 / 实际完成 / 心得复盘, 时间线展示
- **数据图表** (Chart.js):
  - 4 场全马成绩 + 均HR 对比
  - 5km 分段配速曲线
  - 22 周训练量分布
- **导出进度**: 一键导出 JSON (含完成记录 + 日志),可备份/迁移到其他设备
- **重置进度**: 重新开始训练时清空记录 (可选清空日志)

### 显示
- **暗色/浅色主题**: 顶部按钮切换,记忆偏好
- **响应式**: 适配手机 / 平板 / 桌面
- **打印优化**: 顶部"⎙ 打印"按钮,自动隐藏交互元素,适合 A4 打印

## 训练计划概览

- **目标**: 2:55:00 (配速 4:08/km)
- **当前 PB**: 2:58:21 (2024 天津)
- **周量**: 125 km (固定 6 天分布) · 月度目标 500 km · 全年 6000 km
- **总周数**: 22 周
- **5 个阶段**:
  - 基础期 I (W1-W4, 5/25-6/21) 强度引入
  - 基础期 II (W5-W9, 6/22-7/26) T+I 交替, **W9 半马 T 测试**
  - 强化期 (W10-W14, 7/27-8/30) 双引擎
  - 比赛期 (W15-W19, 8/31-10/4) MP 特异性, **W16 25km MP 关键日**
  - 减量期 (W20-W22, 10/5-10/25) 量降+比赛

## 部署到 GitHub Pages

### 方法 1: 网页操作 (推荐, 5 分钟)

1. 在 GitHub 创建新 repo,例如 `2026-tianjin-marathon`
2. 上传所有文件到仓库根目录:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `data.js`
   - `README.md`
   - `.nojekyll` (空文件,告诉 GitHub 不用 Jekyll 处理)
3. 仓库 Settings → Pages → Source 选 `Deploy from a branch` → Branch 选 `main` / 目录选 `/ (root)` → Save
4. 等 1-2 分钟,访问 `https://<用户名>.github.io/2026-tianjin-marathon/`

### 方法 2: 命令行

```bash
cd 2026-shm-training      # 或重命名后的目录
git init
git add .
git commit -m "Initial commit: 2026 Tianjin Marathon training plan"
git branch -M main
git remote add origin https://github.com/<你的用户名>/2026-tianjin-marathon.git
git push -u origin main
```

然后在 GitHub 仓库 Settings → Pages 启用即可。

## 项目结构

```
2026-tianjin-marathon/
├── index.html       # 主页面 (HTML 结构)
├── styles.css       # 样式 (light/dark 主题, 打印优化)
├── app.js           # 交互逻辑 (倒计时, 勾选, 图表, 计算器)
├── sync.js          # 跨设备同步 (GitHub Gist API)
├── data.js          # 训练计划数据 (22 周, 力量动作, 配速)
├── README.md        # 本文档
└── .nojekyll        # GitHub Pages 配置 (跳过 Jekyll)
```

## 访问控制 (密码门)

应用通过客户端 PBKDF2-SHA256 密码门保护,只有输入正确密码的用户才能看到内容。

### 默认密码

**`Jerry-TJM-2026-go`** ← **强烈建议立即修改!**

### 修改密码 (推荐)

1. 在浏览器打开站点 → 用默认密码登录
2. 按 F12 打开开发者控制台
3. 输入 `generateHash('你想用的新密码')` 回车
4. 复制控制台输出的 Hash 字符串
5. 编辑 `auth.js` 第 9 行 `PASSWORD_HASH: '...'`, 把 Hash 粘贴进去
6. `git add auth.js && git commit -m "Update password" && git push`
7. 1-2 分钟后 GitHub Pages 重新部署, 新密码生效

### 安全说明

⚠️ **客户端鉴权的真实强度**:

- ✅ 可以阻挡 99% 非技术用户
- ✅ PBKDF2 25 万次迭代防止哈希字典攻击 (强密码极难破解)
- ✅ 密码不发送任何服务器, 完全本地验证
- ✅ 30 天免登录 (localStorage) 或会话级 (sessionStorage)
- ❌ **懂技术的用户可以**:
  - View source 看到 hash, 但破解需要密码本身
  - Fork 仓库, 删掉 auth.js 部署自己的副本看代码 (但看不到你的训练数据 — 数据在私人 Gist)
  - 通过浏览器调试器跳过验证 (但 hash 错就是错, 即使强行跳过也无法获得真实密码)

### 更高级的保护选项 (可选升级)

如客户端密码门不够强:

| 方案 | 强度 | 成本 | 复杂度 |
|---|---|---|---|
| GitHub Pro + Private Pages | 完全私有 | $4/月 | 低 |
| Cloudflare Access (Zero Trust) | 服务端鉴权 | 免费 (需自定义域名 + DNS) | 中 |
| Vercel/Netlify + Password Protect | 服务端鉴权 | $20/月 | 低 |
| 内容加密 (Staticrypt) | 内容加密 | 免费 | 中 |

## 跨设备同步配置

应用使用 **GitHub Gist API** 实现多设备数据同步。所有数据 (进度勾选 + 训练日志) 存在你私人 Gist 中,
两台或多台电脑用同一个 Personal Access Token (PAT) 即可双向同步。

### 第一台设备:开启同步

1. **创建 PAT**: 访问 https://github.com/settings/tokens?type=beta
   - Token type: **Fine-grained personal access token**
   - Token name: 任意 (例如 "TJM 2026")
   - Expiration: 自选 (建议 1 年)
   - Repository access: **Public Repositories (read-only)** (无需 repo 权限)
   - **Permissions → Account permissions → Gists → 选 Read and write**
   - 生成并复制 PAT (以 `github_pat_` 开头)
2. 在网站点击右上 **☁ 同步** → 粘贴 PAT → 点 **开启同步**
3. 应用自动创建一个名为 `2026 TJM Training Progress (DO NOT DELETE)` 的私有 Gist
4. 此后每次勾选 / 写日志后, 数据 2 秒后自动推送到 Gist

### 第二台设备:接入同步

1. 在第二台电脑上打开同一个 GitHub Pages URL
2. 点击右上 **☁ 同步** → 粘贴**相同的 PAT** (不需要重新创建)
3. 应用自动识别已有 Gist 并拉取数据合并到本地
4. 双向同步从此开始 — 任一设备的修改 2 秒内同步到另一台

### 同步机制

- **触发**: 任意保存 (勾选 / 日志保存) 后防抖 2 秒推送
- **启动**: 打开网页时自动拉一次远程, 合并本地
- **合并策略**:
  - **完成勾选 (progress)**: 任一端为 true 即 true (避免误删)
  - **训练日志 (logs)**: 按 `savedAt` 时间戳取较新者
- **手动同步**: 任何时候点 ☁ 同步 → 立即同步
- **状态指示**: 按钮颜色 — 绿✓=正常 / 橙↻=同步中 / 红⚠=错误

### 安全说明

- **PAT 仅存浏览器 localStorage**, 不发送任何第三方
- **Gist 设置为 Secret** (Unlisted), 只有持 Gist URL 才能访问
- 所有 API 调用直接到 `api.github.com`, 没有中间服务器
- 推荐 fine-grained token, 限定 Gists 权限, 避免使用 classic token

### 取消同步

点 ☁ 同步 → 取消同步。本地 PAT 和 Gist ID 关联被清除, Gist 本身不删 (可手动到 https://gist.github.com 删除)。


## 本地预览

不需要构建,任意静态服务器即可:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve

# 或者直接用浏览器打开 index.html
```

## 自定义

### 修改训练计划

编辑 `data.js`:
- `RUNNER`: 个人参数 (年龄/体重/PB 等)
- `WEEKS`: 22 周训练内容
- `STRENGTH`: 力量训练动作
- `RACE_DAY`: 比赛日期 (修改这一行即可整站同步)
- `PLAN_START`: 训练启动日

### 修改样式

编辑 `styles.css` 顶部的 CSS 变量:

```css
:root {
  --accent: #b91c1c;  /* 主题色 */
  --gold: #b45309;    /* 高亮色 */
  ...
}
```

## 隐私

- 所有数据存于**你自己的浏览器 localStorage**
- 不发送任何数据到任何服务器
- Chart.js 通过 CDN 加载 (jsdelivr),如需完全离线可下载到本地

## 训练计划方法论来源

- Jack Daniels 《Daniels' Running Formula》 — VDOT 系统 / 5 训练区间
- Pfitzinger & Douglas 《Advanced Marathoning》 — MP 长跑特异性
- Rønnestad & Mujika 2014 — 耐力跑者大重量力量训练
- 4 场用户全马 FIT 文件秒级数据分析 (`fit_marathon_analyze.py`)

## 比赛信息

- **赛事**: 2026 天津马拉松
- **日期**: 2026-10-25 (周日, **推测值**, 官方公告待发布)
- **起点**: 待官方公布 (历年为天津市奥林匹克中心 / 海河外滩)
- **目标**: sub 2:55:00 (配速 4:08/km)
- **历史**:
  - 2024 天津: 2024-10-19 (跑出 PB 2:58:21)
  - 2025 天津: 2025-10-25 (2:58:49)

## License

MIT — 自由使用、修改、分享。
