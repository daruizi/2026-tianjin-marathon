// 2026 天津马拉松 22 周训练计划数据
// Generated 2026-05-24
// 注: 2026 天津马拉松全马日期为推测值 (基于 2024/10/19 与 2025/10/25 规律), 官方公告待确认

const RUNNER = {
  age: 42,
  gender: '男',
  height: 175,
  weight: 64,
  bmi: 20.9,
  trainingYears: 8,
  weeklyKm: 125,
  monthlyKm: 500,
  yearlyKm: 6000,
  currentPB: '2:58:21',
  pbRace: '2024 天津',
  goal: '2:55:00',
  goalPace: '4:08/km',
  vdotCurrent: 60,
  vdotTarget: 61,
};

const RACE_DAY = new Date('2026-10-25T07:00:00+08:00');  // 天津马拉松 (推测)
const PLAN_START = new Date('2026-05-25T00:00:00+08:00');  // W1 Monday

// 4 场全马历史数据
const HISTORY = [
  { name: '2024 天津 (PB)', date: '2024-10-19', time: '2:58:21', seconds: 10701, pace: '4:12', hr: 160, vi: 0.4, drift: -1 },
  { name: '2025 无锡',     date: '2025-03-22', time: '2:59:51', seconds: 10791, pace: '4:13', hr: 169, vi: 3.7, drift: -5 },
  { name: '2025 天津',     date: '2025-10-25', time: '2:58:49', seconds: 10729, pace: '4:12', hr: 165, vi: 0.4, drift: 0 },
  { name: '2026 石家庄',   date: '2026-03-28', time: '2:59:34', seconds: 10774, pace: '4:13', hr: 164, vi: 0.9, drift: 2 },
];

// 5km 分段配速对比 (秒/km)
const SEGMENTS = {
  labels: ['0-5','5-10','10-15','15-20','20-25','25-30','30-35','35-40','40-42'],
  races: {
    '2024 天津':   [254, 254, 253, 252, 252, 251, 252, 251, 248],
    '2025 无锡':   [278, 256, 250, 249, 252, 252, 254, 253, 249],
    '2025 天津':   [255, 254, 252, 251, 254, 252, 252, 253, 249],
    '2026 石家庄': [253, 255, 251, 250, 253, 254, 255, 256, 253],
  }
};

// 配速表 v3 — 2026-08-23 据 W4-W13 十周实测数据重新校准 (见 W4-W13-十周阶段复盘.html)
// 「信心优先阶梯」已毕业: 6/07 定的 4:05 起步档, 到 8/19 已能做 15.9km 主课 @3:57 (HR169/峰值181)。
// 实测最大心率 183 (8/5), 高于此前假设。165+ 停留从 2 min/周 涨到 71 min/周 —— 高心率耐受缺口已补上。
// 新的唯一缺口: 马拉松专项耐力。十周长跑内最长连续 4:08 段仅 3.1 km (计划要求 18 km)。
// ⚠ 夏训判读: 26-28℃ 下 MP 的等效配速是 4:21-4:28。9 月中前 MP 课一律按心率 155-163 判定, 不要追配速。
const PACES = {
  E:        { range: '5:00-5:20', hr: '≤145', desc: '真·有氧, 大部分跑量在这 (实测执行良好)' },
  recovery: { range: '5:20-5:40', hr: '≤140', desc: '周四专用, 慢即正确' },
  M:        { range: '4:08',      hr: '155-163', heat: '26-28℃ → 4:21-4:28', desc: '★ 目标比赛配速 — 剩余 9 周的唯一重点, 必须进长跑' },
  T:        { range: '3:55-4:00', hr: '165-172', desc: '已达成: 8/19 主课 15.9km @3:57 · 维持即可, 不再加码' },
  I:        { range: '3:38-3:45', hr: '175-181', desc: '已达成: 8/5 的 9×1000m @3:52 · 比赛期只保留少量' },
  R:        { range: '3:25-3:30', hr: '—',       desc: '已达成: 8/19 的 10×390m @3:31 · 维持神经肌肉即可' },
};

// 气温 → MP 等效配速折算 (含湿度影响的经验区间, 仅供判读)
const HEAT_TABLE = [
  { temp: '10-14℃', mp: '4:08',      judge: '看配速', note: '10/25 天津清晨预期, 这是真正的目标值' },
  { temp: '18-20℃', mp: '4:12-4:15', judge: '看配速', note: '10 月上旬, 可按配速校准' },
  { temp: '23-25℃', mp: '4:17-4:22', judge: '配速+心率', note: '9 月中下旬, 两者取先到者' },
  { temp: '26-28℃', mp: '4:21-4:28', judge: '只看心率', note: '★ 当前 8/9 月 — 锁 HR 155-163' },
  { temp: '30℃+',   mp: '4:27-4:36', judge: '只看心率', note: '或把专项课挪早 / 改期' },
];

// 每周固定 6 天框架 v2 — 2026-08-23 修订
// 改动理由 (据 W4-W13 实测): ① 周六从 19→15km 纯 E, 给周日专项课让路 (W12/W13 出现 64km/60km 周末,
// 直接导致 8/23 长跑均配 5:26、中段崩到 6:06); ② 周日从 37km 匀速改成 30-35km 内嵌 MP —— 时长更短, 专项价值高一个量级。
// 周二/周四可 ±3km 微调, 以命中当周 vol 目标。
const WEEK_FRAME = [
  { day: '周一', km: 0,  type: 'strength', label: '力量 (防伤最小集)', detail: '25 min: 单腿离心提踵 + 保加利亚分腿蹲 + 核心' },
  { day: '周二', km: 22, type: 'E',        label: 'E 真慢',   detail: 'HR ≤145 + 6×100m strides' },
  { day: '周三', km: 17, type: 'quality',  label: '主质量课', detail: 'T 为主 (含 WU + 主课 + CD) · 关键周主动减量护周日' },
  { day: '周四', km: 20, type: 'recovery', label: 'E 真·恢复', detail: 'HR ≤140, 配速 5:20+' },
  { day: '周五', km: 12, type: 'E',        label: 'E + 力量 #2', detail: 'E 轻松 + 力量 15 min (Pallof / 单腿硬拉 / 臀桥)' },
  { day: '周六', km: 15, type: 'E',        label: 'E 短·纯有氧', detail: '★ HR ≤145, 配速 5:15+ — 绝不跑快, 给周日让路' },
  { day: '周日', km: 34, type: 'long',     label: '★ 专项长跑 (内嵌 MP)', detail: '30-35km, MP 段按阶梯递增: 12→14→16→8→20→14' },
];

// 22 周计划 (天津马拉松版)
const WEEKS = [
  // 基础期 I (4 周, 5/25-6/21) - 强度引入 [基于 HRV BELOW 已修订 W1]
  { wk: 1,  start: '2026-05-25', phase: 'base1',  vol: 95,   wednesday: '[降级] WU 4km + 3×5min @ 4:00 (jog 2min) + CD ~13km · HRV 异常应急', sunday: '30km E (降量, 原 37km)', note: 'W1 降级 · 等 HRV 回 IN_RANGE 再上量' },
  { wk: 2,  start: '2026-06-01', phase: 'base1',  vol: 125, wednesday: 'WU 4km + 4×8min @ 4:00 (jog 2min) + CD ~9km',  sunday: '33km E + 末段 4 km @ MP', note: 'T 引入 + MP 首次' },
  { wk: 3,  start: '2026-06-08', phase: 'base1',  vol: 125, wednesday: '[★ I 提前] WU 4km + 4×800m @ 3:42 (jog 400m) + CD ~9km', sunday: '31km E + 末段 6 km @ MP', note: '★ I 训练提前引入 (原 W6)', star: true },
  { wk: 4,  start: '2026-06-15', phase: 'base1',  vol: 100,   wednesday: '[cutback] [R] WU 4km + 8×400m @ 3:25 (jog 90s) + CD ~10km', sunday: '32 km E (无 MP)', note: 'Cutback + ★ R 训练首次', cutback: true },
  // 基础期 II (5 周, 6/22-7/26) - T+I 交替 + 半马测试
  { wk: 5,  start: '2026-06-22', phase: 'base2',  vol: 125, wednesday: '[T] WU 4km + 4×2km @ 3:58 (jog 2min) + CD ~7km', sunday: '29km E + 末段 8 km @ MP', note: 'T 量加大' },
  { wk: 6,  start: '2026-06-29', phase: 'base2',  vol: 125, wednesday: '[I] WU 4km + 5×1200m @ 3:40 (jog 400m) + CD ~9km', sunday: '31km E + 中段 6 km @ MP', note: 'I 升级到 1200m' },
  { wk: 7,  start: '2026-07-06', phase: 'base2',  vol: 125, wednesday: '[T] WU 4km + 4×2km @ 3:55 (jog 2min) + CD ~7km',  sunday: '27km E + 中段 10 km @ MP', note: 'T 压到标准配速' },
  { wk: 8,  start: '2026-07-13', phase: 'base2',  vol: 125, wednesday: '[R] WU 4km + 10×400m @ 3:25 (jog 90s) + CD ~9km', sunday: '25km E + 中段 12 km @ MP', note: '★ R 训练 (神经肌肉)', star: true },
  { wk: 9,  start: '2026-07-20', phase: 'base2',  vol: 105,   wednesday: '[T] 轻量: WU 3km + 20min @ 3:55 + CD 3km ≈ 14km',  sunday: '★ 半马 T 测试: WU 4km + 21.1 km @ T (~1:23-1:25) + CD 4km ≈ 29km', note: '★ go/no-go 节点', star: true, key: true },
  // 强化期 (5 周, 7/27-8/30) - 双引擎
  { wk: 10, start: '2026-07-27', phase: 'build',  vol: 100,   wednesday: '[cutback] [T] WU 4km + 3×8min @ 3:55 + CD ~9km',   sunday: '32 km E', note: 'Cutback', cutback: true },
  { wk: 11, start: '2026-08-03', phase: 'build',  vol: 125, wednesday: '[I] WU 4km + 5×1200m @ 3:38 (jog 400m) + CD ~9km',  sunday: '22km E + 中段 15 km @ MP', note: 'MP 突破 15' },
  { wk: 12, start: '2026-08-10', phase: 'build',  vol: 125, wednesday: '[R+I] WU 4km + 4×400m @ 3:25 + 4×1000m @ 3:38 (jog 400m) + CD ~6km',   sunday: '19km E + 中段 18 km @ MP', note: '★ R+I 混合 + MP 突破 18', star: true },
  { wk: 13, start: '2026-08-17', phase: 'build',  vol: 125, wednesday: '[I] WU 4km + 6×1200m @ 3:38 (jog 400m) + CD ~6km',  sunday: '19km E + 中段 18 km @ MP', note: 'I 量峰值' },
  // ===== 以下 W14-W22 为 2026-08-23 修订版 (v2) =====
  // 修订依据: W4-W13 十周实测 —— 长跑内最长连续 MP 段仅 3.1km (计划要求 18km), 原计划 W15 直接要 22km MP、
  // W16 要 25km MP, 在此基础上不可能落地。改为「分段 MP → 连续 MP」阶梯: 12 → 14 → 16连续 → 8 → 20连续 → 14。
  // 同时周量 136 → 124-128, 并真正执行 W14 / W17 两个减量周。详见 W4-W13-十周阶段复盘.html
  { wk: 14, start: '2026-08-24', phase: 'build',  vol: 110, days: [0, 20, 17, 17, 10, 14, 32], wednesday: '[T] WU 3km + 5×2km @ 3:58 (jog 2min) + CD 3km ≈ 17km', sunday: '32km = 8km E + 3×4km @ MP (1.5km E 浮动) + 6km E 收尾 · MP 合计 12km', note: '★ 真减量周 (−25km) + MP 阶梯启动 · 先教会身体认识这个配速', cutback: true, star: true },
  // 比赛期 (5 周, 8/31-10/4) - MP 特异性
  { wk: 15, start: '2026-08-31', phase: 'race',   vol: 126, days: [0, 24, 16, 21, 15, 16, 34], wednesday: '[T] WU 3km + 3×3km @ 4:00 (jog 3min) + CD 3km ≈ 16km', sunday: '34km = 8km E + 2×7km @ MP (2km E 浮动) + 5km E 收尾 · MP 合计 14km', note: 'MP 段落拉长, 浮动缩短' },
  { wk: 16, start: '2026-09-07', phase: 'race',   vol: 128, days: [0, 24, 14, 22, 17, 16, 35], wednesday: '[T 轻] WU 3km + 2×15min @ 4:00 (jog 3min) + CD 3km ≈ 14km · 刻意减量保护周日', sunday: '★ 35km = 7km E + 16km 连续 @ MP + 12km E 收尾 · 全程补给/装备演练', note: '★ 新 go/no-go 节点 (替代已错过的 W9 半马测试) · 判据: ≤4:10 或 22℃+ 时 HR ≤163, 后 4km 不慢于前 4km', star: true, key: true },
  { wk: 17, start: '2026-09-14', phase: 'race',   vol: 108, days: [0, 20, 13, 18, 15, 16, 26], wednesday: '[I] WU 3km + 5×1000m @ 3:45 (jog 90s) + CD 3km ≈ 13km', sunday: '26km E + 末段 8 km @ MP', note: '★ 真减量周 (−20km) · 吸收 W16, 保留一点速度', cutback: true },
  { wk: 18, start: '2026-09-21', phase: 'race',   vol: 126, days: [0, 24, 15, 22, 15, 16, 34], wednesday: '[T 轻] WU 3km + 4×2km @ 3:58 (jog 2min) + CD 3km ≈ 15km · 同样刻意减量', sunday: '★★ 34km = 8km E + 20km 连续 @ MP + 6km E 收尾', note: '★★ 全周期最重要的一课 · 气温应已 ≤22℃, 按配速判定', star: true, key: true },
  { wk: 19, start: '2026-09-28', phase: 'race',   vol: 114, days: [0, 22, 14, 20, 14, 16, 28], wednesday: '[T] WU 3km + 3×2km @ 3:55 + 4×400m @ 3:30 + CD 3km ≈ 14km', sunday: '28km = 8km E + 14km @ MP + 6km E · 全套比赛装备 + 起跑时间模拟 + 补给复演', note: '最后一次长专项, 之后只减不加' },
  // 减量期 (3 周, 10/5-10/25)
  { wk: 20, start: '2026-10-05', phase: 'taper',  vol: 92, days: [0, 18, 12, 16, 12, 12, 22], wednesday: '[taper T] WU 3km + 3×1.6km @ 3:55 + CD 3km ≈ 12km · 周二/四/六 ↓', sunday: '22km E + 末段 8 km @ MP', note: 'Taper 启动 · 量降强度保 · 力量 ↓ 每周 1 次', cutback: true },
  { wk: 21, start: '2026-10-12', phase: 'taper',  vol: 68, days: [0, 14, 9, 12, 9, 8, 16], wednesday: '[taper] WU 2km + 3×1km @ 3:55 + CD 2km ≈ 9km · 周二/四/六 ↓ 12km', sunday: '16km E + 4km @ MP (最后一次触碰比赛配速)', note: '睡眠 / 碳水优先级 > 训练 · 力量停', cutback: true },
  { wk: 22, start: '2026-10-19', phase: 'taper',  vol: 66, days: [0, 7, 8, 6, 0, 3, 42], wednesday: '8km E · 周二 WU 2km + 3×1km @ MP + CD 2km · 周四 6km E + 4 strides · 周五 跑休 · 周六 3km + 4 strides', sunday: '★★ 10/25 比赛日 · 7:30 鸣枪 · 目标 2:54:30 · 前 10km 不快于 4:10 ★★', note: '★ 比赛周', star: true, race: true },
];

// ===== W4-W13 实测复盘数据 (2026-06-15 ~ 08-24, 由 81 个 FIT 文件秒级解析) =====
// 完整分析见 W4-W13-十周阶段复盘.html
const BLOCK_REVIEW = {
  range: '2026-06-15 ~ 2026-08-24',
  grade: 'B+',
  totalKm: 1361.9, totalHours: 118.0, runDays: 60, runSessions: 63, restDays: 9,
  avgTempC: 26.0, maxTempC: 35, totalAscentM: 3172, overreachPct: 29,
  headline: '引擎造好了, 但从没装到赛道上 —— 十周 0 次真正的马拉松配速长跑',
  weeks: [
    // wk, 计划量, 实际量, 165+停留(min), 165+占比%, 主课km, 主课均配(s), 计划MP km, 实际最长连续MP km, 长跑脱钩%
    { wk: 4,  planKm: 100, km: 134.6, hr165min: 2,  hr165pct: 0.3, mainKm: null,  mainPace: null,  planMP: 0,    mpBlock: 0.0, decouple: -18.7 },
    { wk: 5,  planKm: 125, km: 135.2, hr165min: 41, hr165pct: 5.8, mainKm: 9.70,  mainPace: 245.7, planMP: 8,    mpBlock: 1.6, decouple: -8.5  },
    { wk: 6,  planKm: 125, km: 136.0, hr165min: 5,  hr165pct: 0.7, mainKm: null,  mainPace: null,  planMP: 6,    mpBlock: 0.9, decouple: -3.6  },
    { wk: 7,  planKm: 125, km: 135.9, hr165min: 22, hr165pct: 3.0, mainKm: 9.47,  mainPace: 248.1, planMP: 10,   mpBlock: 0.7, decouple: -12.9 },
    { wk: 8,  planKm: 125, km: 135.7, hr165min: 45, hr165pct: 6.4, mainKm: 10.02, mainPace: 242.0, planMP: 12,   mpBlock: 1.0, decouple: -10.2 },
    { wk: 9,  planKm: 105, km: 135.9, hr165min: 50, hr165pct: 7.2, mainKm: 9.74,  mainPace: 240.3, planMP: 21.1, mpBlock: 0.7, decouple: -22.5 },
    { wk: 10, planKm: 100, km: 135.7, hr165min: 67, hr165pct: 9.6, mainKm: 9.37,  mainPace: 249.8, planMP: 0,    mpBlock: 0.7, decouple: -32.6 },
    { wk: 11, planKm: 125, km: 136.4, hr165min: 49, hr165pct: 6.8, mainKm: 12.39, mainPace: 229.8, planMP: 15,   mpBlock: 1.6, decouple: -13.4 },
    { wk: 12, planKm: 125, km: 139.2, hr165min: 47, hr165pct: 6.5, mainKm: 14.45, mainPace: 250.2, planMP: 18,   mpBlock: 3.1, decouple: -9.1  },
    { wk: 13, planKm: 125, km: 137.2, hr165min: 71, hr165pct: 9.8, mainKm: 15.89, mainPace: 237.4, planMP: 18,   mpBlock: 4.1, decouple: -16.1 },
  ],
  wins: [
    '出勤 60/60 天零缺勤, 周量方差极小 (134.6-139.2km), 平均气温 26℃ 无一次因天气缩水',
    '高心率耐受缺口被打开: 165+ 停留 2 → 71 min/周, 峰值心率摸到 183 (此前全年最高 174)',
    '周三主课从 9.7km @4:06 长到 15.9km @3:57',
    '跑姿改善: 高速段垂直振幅比 7.11 → 5.92, 触地 247 → 238ms, 步幅 1160 → 1327mm',
  ],
  gaps: [
    '① 决定成败: 长跑内嵌 MP 段十周 0 次执行 (计划 8→18km, 实际最长连续 4:08 段 3.1km)',
    '② 十周无一次减量周 (W4/W9/W10 超计划 +31~36km), 长跑脱钩恶化到 −32.6%, TE 5.0 占 29%',
    '③ W9 半马 go/no-go 测试被跳过, 且 W12/W13 出现 64km/60km 双长跑周末, 周六吃掉周日',
    '④ 力量训练十周无有效记录 (计划 20 次)',
  ],
  verdict: '按现状直接上场约 2:57-2:59 (仍可能是 PB); 执行 W14-W22 修订方案且 W16/W18 两课达标, 2:54-2:56 在射程内。',
  // ⚠ 2026-08-30 方法学修正 (详见 W14-训练分析报告.html 第 6 节):
  // 上面 weeks[].decouple 的 -8% ~ -33% 是「含停表时间」口径算出的。手表暂停期间不写记录点,
  // 等红灯/补水的静止时间被算成了「跑得更慢」, 而停顿恰好集中在长跑后半程。
  // 按净运动时间重算, 同一批文件的脱钩率全部落在健康区间 (-3.9% ~ +3.4%), 例: 8/02 由 -32.6% → -0.7%。
  // 结论修正: 撤回「脱钩恶化 = 累积过度疲劳」的判断; 保留并强化更根本的一条 ——
  // 这些长跑真正的问题是「碎片化」(单次停表 20-60 min), 马拉松最需要的「不停地跑很久」从未发生。
  decoupleFixed: { 4: -3.9, 5: -1.6, 6: -1.8, 7: -1.8, 8: -1.6, 9: -3.1, 10: -0.7, 11: 3.4, 12: 0.8, 13: -3.3 },
  pauseMinPerLongRun: { 4: 17.1, 5: 6.8, 6: 6.3, 7: 11.9, 8: 27.7, 9: 22.0, 10: 41.4, 11: 20.1, 12: 26.6, 13: 27.2 },
};

// ===== 每周实测复盘 (逐周追加) =====
// 口径: 净运动时间 (相邻记录点间隔 >2.5s 判定为停表并剔除); 心率区间按实测最大心率 183。
// 「最长连续 ≤X 段」= 100m 重采样后平均配速满足阈值的最长连续块。
const WEEK_REVIEWS = [
  {
    wk: 14, range: '2026-08-24 ~ 08-30', iso: 35, grade: 'A-',
    report: 'W14-训练分析报告.html',
    headline: '十周等的那一课, 终于跑出来了 —— 长跑末段 16 km @ 4:22.7 / HR 156',
    planKm: 110, km: 131.1, hours: 11.35, runDays: 6, sessions: 6,
    avgTempC: 23.3, ascentM: 319, avgPace: '5:11.7',
    hr165min: 28.9, hr175min: 6.0, mpHrMin: 63.0,       // MP 心率带 155-163 全周停留
    zones: { z1: 231.3, z2: 295.0, z3: 69.1, z4: 61.3, z5a: 22.9, z5b: 6.0 },  // 分钟
    days: [  // 计划 vs 实际
      { d: '周一', plan: 0,  act: 0,     note: '休息; 力量无记录' },
      { d: '周二', plan: 20, act: 21.43, pace: '5:17.1', hr: 137, temp: 28, ok: true },
      { d: '周三', plan: 17, act: 21.33, pace: '5:19.4', hr: 129, temp: 24, ok: true,  note: '★ 当日下雨, 主课顺延到周四, 周三/周四对调 —— 合理处理; 当天照跑 21.3km E, 未缺勤' },
      { d: '周四', plan: 17, act: 16.14, pace: '5:21.9', hr: 150, temp: 24, ok: false,
        card: '2×1000m @4:00 + 2×1000m @3:50 + 2×1000m @3:40 + 10×400m @4:00',
        note: '因雨从周三顺延而来(改期合理)。递减梯执行精准(平均 −3.0 s/km); ' +
              '但收尾 10×400m 课表 4:00、实际 3:31.5 (−28.5 s/km, 9/10 组快 20+ s/km), ' +
              '跑成了 R 配速, 且贡献了全周唯一的 175+ 心率(峰值 175-179 = 实测最大 183 的 96%)。' +
              '注: 当日课表与 data.js WEEKS[13].wednesday 的「5×2km @3:58」不一致, 以跑者当日课表为准。' },
      { d: '周五', plan: 10, act: 13.34, pace: '5:48.4', hr: 123, temp: 21, ok: true },
      { d: '周六', plan: 14, act: 22.22, pace: '5:27.5', hr: 128, temp: 21, ok: false, note: '配速/心率达标, 量 +59%' },
      { d: '周日', plan: 32, act: 36.67, pace: '4:36.7', hr: 148, temp: 22, ok: true, note: '★ 全周期最佳长跑' },
    ],
    longRun: {
      date: '2026-08-30', km: 36.67, pace: '4:36.7', hr: 148, maxHr: 168, tempC: 22, ascentM: 204,
      pauseMin: 5.3, decouple: -2.0,
      thirds: [
        { seg: 'km 1-10',  km: 10, pace: '4:59.8', hr: 134 },
        { seg: 'km 11-20', km: 10, pace: '4:37.2', hr: 146 },
        { seg: 'km 21-36', km: 16, pace: '4:22.7', hr: 156, star: true },
      ],
      mpBlocks: [  // 专项段拆成 4×4km
        { seg: 'km 21-24', pace: '4:15.4', hr: 154, note: '含第 24km 主动提速 3:56.6' },
        { seg: 'km 25-28', pace: '4:26.0', hr: 153 },
        { seg: 'km 29-32', pace: '4:25.4', hr: 158 },
        { seg: 'km 33-36', pace: '4:23.9', hr: 159, note: '稳态段里最快的 4km' },
      ],
      rolling: { '5k': '4:17.8/155', '10k': '4:22.0/154', '15k': '4:22.5/157', '21.1k': '4:24.5/155' },
      longestBlock: { '4:08': 2.3, '4:15': 4.1, '4:20': 6.7, '4:28': 26.3, '4:40': 36.6 },  // km
      mpHrMin: 44.5, mpHrKm: 10.15,   // 落在 HR 155-163 的时长/距离 (计划要求 MP 12km)
      planned: '32km = 8 E + 3×4km @ MP (1.5 E 浮动) + 6 E · MP 合计 12km',
      actual: '36.67km 连续渐进跑; MP 段自然出现在 km 21-36, 未按分段结构执行',
    },
    wins: [
      '★ 长跑内首次出现真正的专项段: 末段 16 km @ 4:22.7 / HR 156 (22℃), 且末 4km 是稳态段里最快的',
      '★ 长跑碎片化基本消失: 停表 5.3 min (W13 全周 104.9 min, 8/22 单次 60.4 min), 脱钩仅 -2.0%',
      'MP 心率带 (155-163) 全周 63.0 min, 其中 44.5 min (73%) 来自长跑 —— 位置终于对了',
      '「周六绝不跑快」被遵守: HR 128 / 5:27, 没有变成第二个长跑 (W12/W13 的双长跑周末未重演)',
      '轻松日真轻松: 周二 137 / 周三 129 / 周五 123 / 周六 128 bpm, 两极化干净',
      '周量 131.1 km 是 11 周最低值 (此前 11 周全部 134.6-139.2)',
      '遇雨不缺勤: 周三下雨照跑 21.3km E, 主课顺延一天而不是取消 —— 外部条件变化时的处理成熟',
      '递减梯执行精度很高: 6×1000m 的 4:00/3:50/3:40 三档平均只差 −3.0 s/km, 全周期最干净的一堂间歇课',
    ],
    gaps: [
      '① 减量周第 4 次没减下来: 131.1 vs 计划 110 (+21.1km); 但已是四个减量周里超出最少的一次',
      '② 周六又吃掉配额: 22.22 vs 14 (+8.2km), 占全周超量的 39%',
      '③ 课表里「该慢的部分」被跑快: 周四收尾 10×400m 课表 4:00 → 实际 3:31.5 (−28.5 s/km)。' +
      '课表按 4:00 写的工作量本有 6km (2×1000m + 10×400m), 实际只有第 1 组 1000m (4:01.2) 落在 4:00 附近, ' +
      '给 MP 供能的阈值量被跑没了。注: 递减梯本身执行精准(−3.0 s/km), 因雨顺延也是正确处理, 两者都不算偏差。',
      '④ 力量训练仍无记录 (计划周一 25min + 周五 15min)',
    ],
    nextFocus: 'W15 唯一新课题 = 把 MP 段挪到长跑前段 (第 9km 起跑 2×7km), 而不是靠渐进「跑进去」。' +
               '另: 他能把配速控得很准(递减梯 −3.0 s/km), 问题只出在「写着慢配速的收尾段」。' +
               'W15 的 3×3km @4:00 是同一类段落, 要提前钉死: 任何一组不得快于 3:57。',
    verdict: '8/23 的结论是「若 MP 阶梯落地则 2:54-2:56」; 这一周把「若」变成了「已」。' +
             '22℃ 的 15km @4:22.5/HR157 折回比赛日 10-14℃ 约合 4:11-4:15, 距目标 4:08 差 3-7 s/km, ' +
             '且心率相对四场全马的 160-165 还留 3-8 bpm 余量。风险已从「能力」转为「纪律」。',
  },
];

// 力量训练动作
const STRENGTH = {
  session1: {
    name: '力量 #1 (周一) — 下肢主力 + 爆发',
    duration: 45,
    focus: '深蹲 + 单腿 RDL + 跳箱',
    exercises: [
      { name: '杠铃深蹲', sets: '4 × 5', intensity: '80% 1RM (RPE 8)' },
      { name: '单腿罗马尼亚硬拉', sets: '3 × 6/腿', intensity: '持哑铃 12-20kg' },
      { name: '跳箱', sets: '3 × 5', intensity: '45-60cm 箱' },
      { name: '单腿提踵 (台阶上)', sets: '3 × 12/腿', intensity: '持哑铃 16kg+' },
      { name: '侧平板', sets: '3 × 30秒/边', intensity: '自重' },
      { name: '死虫', sets: '3 × 10/边', intensity: '自重' },
    ]
  },
  session2: {
    name: '力量 #2 (周五) — 单侧 + 髋稳定 + 跟腱',
    duration: 40,
    focus: '保加利亚分腿蹲 + 离心提踵 + Pallof',
    exercises: [
      { name: '保加利亚分腿蹲', sets: '3 × 6/腿', intensity: '持哑铃 16-24kg' },
      { name: '罗马尼亚硬拉 (双腿)', sets: '4 × 5', intensity: '60-80% 1RM' },
      { name: '单腿臀桥', sets: '3 × 10/腿', intensity: '自重 (后期加重)' },
      { name: 'Pallof press (抗旋转)', sets: '3 × 10/边', intensity: '弹力带/绳索' },
      { name: '鸟狗 (Bird dog)', sets: '3 × 10/边', intensity: '自重, 慢' },
      { name: '离心提踵 (慢下 3 秒)', sets: '3 × 8/腿', intensity: '持哑铃' },
    ]
  },
  periodization: [
    { wk: 'W1-W3',   phase: '学习期',   intensity: 'RPE 6-7, 轻重量',        goal: '熟悉动作, 无伤病' },
    { wk: 'W4-W12',  phase: '构建期',   intensity: 'RPE 7-8, 每 2 周加 2.5-5kg', goal: '神经驱动 + 肌力' },
    { wk: 'W14-W19', phase: '防伤最小集 (2026-08-23 降级)', intensity: '周一 25min + 周五 15min, 自重/轻哑铃', goal: '距赛 9 周, 大重量窗口已关闭; 只保留小腿离心 + 单腿稳定 + 核心, 对冲 130km/周 的跟腱负荷' },
    { wk: 'W20-W21', phase: '减量期',   intensity: '仅 1 次/周, 轻量',         goal: '维持神经记忆' },
    { wk: 'W22',     phase: '比赛周',   intensity: '完全停力量',               goal: '肌肉新鲜' },
  ]
};

// 比赛日策略
const RACE_STRATEGY = {
  segments: [
    { name: '开局守', range: '0-10 km',  pace: '4:10-4:12', cumulative: '~41:30' },
    { name: '巡航',   range: '10-25 km', pace: '4:07-4:09', cumulative: '~1:43:00' },
    { name: '稳住',   range: '25-35 km', pace: '4:06-4:08', cumulative: '~2:24:30' },
    { name: '冲刺',   range: '35-42 km', pace: '≤4:08',     cumulative: '≤2:54:30' },
  ],
  fueling: [
    { time: '赛前 3h',     item: '燕麦 + 香蕉 + 蜂蜜', qty: '~500 kcal' },
    { time: '赛前 30 min', item: '能量胶 + 100ml 水',  qty: '1 支' },
    { time: '5/10/15 km',  item: '水 + 电解质',         qty: '1 杯' },
    { time: '10 km',       item: '能量胶',              qty: '1 支' },
    { time: '20 km',       item: '能量胶 + 咖啡因',     qty: '1 支' },
    { time: '25 km',       item: '能量胶',              qty: '1 支' },
    { time: '30 km',       item: '能量胶',              qty: '1 支' },
    { time: '35 km',       item: '咖啡因胶',            qty: '最后冲刺燃料' },
  ]
};

// 关键里程碑 (基于 Garmin 8 年数据修订)
const MILESTONES = [
  { date: '2026-05-24', label: '★ HRV 异常,启动周降级', desc: '今日 HRV 25 (BELOW 32-44) · 周日长跑 37→30km · W1 整周降级' },
  { date: '2026-05-25', label: '训练启动 (W1 降级版)',  desc: '力量 #1 学习期 RPE 6 · 周三 T 降级 3×5min' },
  { date: '2026-06-08', label: '★ I 训练提前 (W3)',     desc: '原 W6 改提前: VO2max 启动 (1km PB 5 年没破)' },
  { date: '2026-06-15', label: '★ R 训练首次 (W4)',     desc: '8×400m @ 3:25, 唤醒神经肌肉' },
  { date: '2026-07-26', label: '✗ 半马 T 测试 (W9) — 未执行', desc: '当日改跑 36.8km 匀速长跑, 全周期唯一体能标尺缺失 → 已由 W16 顶替' },
  { date: '2026-08-24', label: '★ 计划 v2 修订 (W14)',   desc: '据十周实测重建: 周量 136→124-128, 真减量周回归, MP 阶梯 12→14→16→8→20→14' },
  { date: '2026-08-30', label: '✓ MP 阶梯第 1 级落地 (W14)', desc: '36.67km 长跑末段 16km @ 4:22.7 / HR 156 (22℃) · 停表仅 5.3min · 脱钩 −2.0% —— 全周期首次真正的专项长跑' },
  { date: '2026-09-13', label: '★ 16 km 连续 MP (W16)',  desc: '新 go/no-go: ≤4:10 或 HR ≤163 且后 4km 不慢于前 4km → 锁定 2:54:30' },
  { date: '2026-09-27', label: '★★ 20 km 连续 MP (W18)', desc: '全周期最重要一课, 峰值专项 · 气温应已 ≤22℃, 按配速判定' },
  { date: '2026-10-05', label: '减量启动 (W20)',        desc: '量降, 力量减到 1 次/周' },
  { date: '2026-10-19', label: '力量完全停 (W22)',      desc: '比赛周, 肌肉储能' },
  { date: '2026-10-25', label: '★★ 比赛日',             desc: '2026 天津马拉松 (日期推测, 待官方确认)' },
];

// 训练日志字段定义 (用于主课记录: 周三质量课 + 周日长跑)
const LOG_FIELDS = [
  { key: 'rpe',     label: '主观努力度 RPE', type: 'range', min: 1, max: 10, default: 6, hint: '1=极轻松 / 5=中等 / 8=费力 / 10=极限' },
  { key: 'feel',    label: '主观感受',       type: 'text',  hint: '一句话: 例如"腿沉但能维持"、"轻松"、"末段掉速"' },
  { key: 'actual',  label: '实际完成',       type: 'text',  hint: '距离 / 配速 / HR, 例如 "8km @ 3:58 avgHR 168"' },
  { key: 'notes',   label: '心得复盘',       type: 'textarea', hint: '反思: 配速控制、补给、装备、天气、身体反馈、下次调整' },
  { key: 'weather', label: '天气/温度',      type: 'text',  hint: '可选: 例如"晴 26°C 微风"' },
];

// 训练日志的目标主课 (key 用于存储)
const LOG_SLOTS = [
  { slot: 'wed', label: '周三主质量课' },
  { slot: 'sun', label: '周日长跑'     },
];

// 阶段元数据 (22 周版)
const PHASES = {
  base1: { name: '基础期 I',  range: 'W1-W4',   color: '#e8f3e8', desc: '强度引入, T 配速从 4:00 起步' },
  base2: { name: '基础期 II', range: 'W5-W9',   color: '#ddeeff', desc: 'T+I 交替, 半马测试' },
  build: { name: '强化期',    range: 'W10-W14', color: '#ffe7c2', desc: 'W10-W13 已完成 (引擎达标, MP 未执行) · W14 已完成: MP 阶梯首次落地 (长跑末段 16km @4:22.7/HR156), 但减量未达标 (131 vs 110)' },
  race:  { name: '比赛期',    range: 'W15-W19', color: '#ffd1d1', desc: 'MP 专项重建: 14 → 16连续 → 8 → 20连续 → 14 km @ 4:08' },
  taper: { name: '减量期',    range: 'W20-W22', color: '#f5e6f5', desc: '量降强度保, 比赛准备' },
};
