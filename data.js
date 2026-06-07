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

// VDOT 61 目标配速 + 当前起步配速 (2026-06-07 据 2026-05-23 实测校准)
// 关键发现: 5/23 滚动最快 1km = 3:55 @ HR158 (次极限, 比全马心率还低) → 真实上限高于 4:00,
//          整周 HR>165 仅 0.8% → 缺口是「高心率耐受 / 速度耐力」, 不是有氧能力。
// 用户偏好 (2026-06-07): 信心优先 — 先从 4:05 起步, 当前配速「完全无压力」后每次降 5 秒进下一档,
//          一档一档逼近 range 列目标 (4:05 → 4:00 → 3:55 → ...)。不急于一步到位。
const PACES = {
  E:        { range: '4:55-5:10', hr: '≤145', desc: '真·有氧, 大部分跑量在这' },
  recovery: { range: '5:00-5:20', hr: '≤140', desc: '周四专用, 慢即正确 (要更慢更短)' },
  M:        { range: '4:08',      hr: '~160', desc: '目标比赛配速 (有氧上毫无压力)' },
  T:        { range: '3:55-4:00', start: '4:05', hr: '168-175', desc: '信心优先: 4:05 起步 → 4:00 → 3:55 (无压力才进下一档)' },
  I:        { range: '3:40',      start: '4:05', hr: '~max-5', desc: 'VO2max: 4:05 建立节奏 → 渐进 3:55 → 3:48 → 3:40' },
  R:        { range: '3:25-3:30', start: '3:50', hr: '—', desc: '200-400m + strides (W4 起): 保守起步 3:50 → 渐进 3:25' },
};

// 每周固定 6 天框架 (基于月 500km / 年 6000km 目标重新设计)
const WEEK_FRAME = [
  { day: '周一', km: 0,  type: 'strength', label: '力量 #1', detail: '下肢主力 + 爆发, 40 min' },
  { day: '周二', km: 19, type: 'E',        label: 'E 真慢',   detail: 'HR ≤145 + 6×100m strides' },
  { day: '周三', km: 22, type: 'quality',  label: '主质量课', detail: 'T 或 I, 隔周交替 (含 WU + 主课 + CD)' },
  { day: '周四', km: 19, type: 'recovery', label: 'E 真·恢复', detail: 'HR ≤140, 配速 5:00+' },
  { day: '周五', km: 9,  type: 'E',        label: 'E + 力量 #2', detail: '9km E + 力量 #2 (单侧 + 髋稳定)' },
  { day: '周六', km: 19, type: 'E',        label: 'E 中等',   detail: 'HR 140-150 + 末段 6×strides, 无强度' },
  { day: '周日', km: 37, type: 'long',     label: '长跑 + MP block', detail: 'MP block 随阶段递增' },
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
  { wk: 14, start: '2026-08-24', phase: 'build',  vol: 100,   wednesday: '[cutback] [T] WU 4km + 4×2km @ 3:55 (jog 2min) + CD ~7km', sunday: '30km E + 末段 8 km @ MP', note: 'Cutback, 强化期收尾', cutback: true },
  // 比赛期 (5 周, 8/31-10/4) - MP 特异性
  { wk: 15, start: '2026-08-31', phase: 'race',   vol: 125, wednesday: '[T] WU 4km + 5×2km @ 3:55 (jog 2min) + CD ~5km',    sunday: '15km E + 中段 22 km @ MP', note: 'MP 22 km' },
  { wk: 16, start: '2026-09-07', phase: 'race',   vol: 125, wednesday: '[T] WU 4km + 2×15min @ 3:55 (jog 3min) + CD ~8km',   sunday: '★ 37km 含 25 km @ MP + 全程比赛补给演练', note: '★ 全周期关键日', star: true, key: true },
  { wk: 17, start: '2026-09-14', phase: 'race',   vol: 100,   wednesday: '[cutback] [T] WU 4km + 3×8min @ 3:55 + CD ~9km',     sunday: '30km E + 末段 8 km @ MP', note: 'Cutback 恢复', cutback: true },
  { wk: 18, start: '2026-09-21', phase: 'race',   vol: 125, wednesday: '[T] WU 4km + 4×2km @ 3:55 (jog 2min) + CD ~7km',    sunday: '19km E + 中段 18 km @ MP', note: '最后一次 18 km MP' },
  { wk: 19, start: '2026-09-28', phase: 'race',   vol: 110,   wednesday: '[T] WU 4km + 4×1.6km @ 3:55 (jog 90s) + CD ~8km',    sunday: '28km E + 中段 18 km @ MP + 装备演练', note: '减量启动前最后一周' },
  // 减量期 (3 周, 10/5-10/25)
  { wk: 20, start: '2026-10-05', phase: 'taper',  vol: 90,   wednesday: '[taper] [T] WU 3km + 3×1.6km @ 3:55 + CD ~5km ≈ 14km · 周二/四/六 ↓ 15km', sunday: '22km E + 末段 10 km @ MP', note: 'Taper 启动, 力量 ↓ 1 次', cutback: true },
  { wk: 21, start: '2026-10-12', phase: 'taper',  vol: 65,    wednesday: '[taper] [T] WU 3km + 3×1km @ 3:55 + CD ~4km ≈ 10km · 周二/四/六 ↓ 12km',    sunday: '22km E (最后一次较长跑, 无 MP)', note: '力量轻量 1 次', cutback: true },
  { wk: 22, start: '2026-10-19', phase: 'taper',  vol: 55,    wednesday: '8km E · 周二 WU 3km + 2×1km @ MP + CD 2km · 周四 6km E + 4 strides · 周五 跑休 · 周六 3km + 4 strides', sunday: '★★ 10/25 比赛日 · 7:30 鸣枪 · 目标 2:54:30 ★★', note: '★ 比赛周', star: true, race: true },
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
    { wk: 'W13-W17', phase: '维持期',   intensity: 'RPE 7, 重量不再加',       goal: '保持力量, 让位跑步质量' },
    { wk: 'W18-W19', phase: '微减期',   intensity: '组数 4 → 3, 重量保持',    goal: '储能' },
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
  { date: '2026-07-26', label: '★ 半马 T 测试 (W9)',    desc: 'sub 2:55 第一个 go/no-go: ≤1:25 高概率' },
  { date: '2026-09-13', label: '★ 25 km MP 长跑 (W16)', desc: '全周期最难一课, 完成 = 锁定一半 sub 2:55' },
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
  build: { name: '强化期',    range: 'W10-W14', color: '#ffe7c2', desc: '双引擎齐上, MP 15-18km' },
  race:  { name: '比赛期',    range: 'W15-W19', color: '#ffd1d1', desc: 'MP 特异性 25km, I 撤回' },
  taper: { name: '减量期',    range: 'W20-W22', color: '#f5e6f5', desc: '量降强度保, 比赛准备' },
};
