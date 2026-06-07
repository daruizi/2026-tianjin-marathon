// 2026 SHM Training Plan V2 — Interactive App

const STORAGE_KEY = 'shm2026-progress-v1';
const LOG_KEY = 'shm2026-logs-v1';
const THEME_KEY = 'shm2026-theme';

// ===== State =====
let progress = loadProgress();
let logs = loadLogs();
let chartInstances = {};
// Expose to window for sync.js
window.progress = progress;
window.logs = logs;

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch (e) { return {}; }
}
function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  window.progress = progress;
  if (typeof triggerSync === 'function') triggerSync();
}
function loadLogs() {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) || '{}');
  } catch (e) { return {}; }
}
function saveLogs() {
  localStorage.setItem(LOG_KEY, JSON.stringify(logs));
  window.logs = logs;
  if (typeof triggerSync === 'function') triggerSync();
}

// ===== Helpers =====
function fmtDate(d) {
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
}
function daysUntil(target) {
  const now = new Date();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}
function getCurrentWeek() {
  const now = new Date();
  if (now < PLAN_START) return 0;
  const diff = now - PLAN_START;
  const wk = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
  return Math.min(wk, 28);
}
function paceToSec(str) {
  const m = str.match(/(\d+):(\d{2})/);
  return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : null;
}
function secToPace(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  renderHero();
  renderFocusWeek();
  renderProfile();
  renderHistory();
  renderWeeks();
  renderStrength();
  renderRaceStrategy();
  renderMilestones();
  renderLogSection();
  bindEvents();
  setTimeout(renderCharts, 100);
  setInterval(renderHero, 60000);  // update countdown every minute
  if (typeof initSync === 'function') initSync();
});

// ===== Theme =====
function applyTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  const btn = document.getElementById('theme-btn');
  if (btn) btn.textContent = saved === 'dark' ? '☀ 浅色' : '☾ 深色';
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  const next = cur === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme();
  Object.values(chartInstances).forEach(c => c && c.destroy());
  chartInstances = {};
  setTimeout(renderCharts, 100);
}

// ===== Hero / Countdown =====
function renderHero() {
  const days = daysUntil(RACE_DAY);
  const hours = Math.floor((RACE_DAY - new Date()) / (1000 * 60 * 60)) % 24;
  const curWk = getCurrentWeek();
  const totalDays = (RACE_DAY - PLAN_START) / (1000 * 60 * 60 * 24);
  const elapsed = Math.max(0, (new Date() - PLAN_START) / (1000 * 60 * 60 * 24));
  const pct = Math.min(100, (elapsed / totalDays) * 100);

  const completedDays = Object.values(progress).filter(v => v).length;
  const totalTrainingDays = 28 * 6;

  const html = `
    <div class="countdown">
      <div class="card"><div class="num">${days}</div><div class="lbl">天到比赛</div></div>
      <div class="card"><div class="num">${curWk || '-'}</div><div class="lbl">当前周</div></div>
      <div class="card"><div class="num">${completedDays}</div><div class="lbl">已完成天数</div></div>
      <div class="card"><div class="num">${totalTrainingDays}</div><div class="lbl">总训练日</div></div>
    </div>
    <div class="progress-row">
      <span class="progress-text">训练周期进度</span>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      <span class="progress-text">${pct.toFixed(1)}%</span>
    </div>
  `;
  document.getElementById('hero-content').innerHTML = html;
}

// ===== Focus week =====
function renderFocusWeek() {
  const curWk = getCurrentWeek();
  const wk = curWk > 0 && curWk <= 28 ? WEEKS[curWk - 1] : WEEKS[0];
  const wkStart = new Date(wk.start + 'T00:00:00+08:00');

  let daysHtml = '';
  WEEK_FRAME.forEach((d, i) => {
    const dayDate = new Date(wkStart.getTime() + i * 24 * 60 * 60 * 1000);
    const key = `w${wk.wk}d${i}`;
    const done = progress[key];
    let detail = d.detail;
    if (i === 2) detail = wk.wednesday;  // 周三
    if (i === 6) detail = wk.sunday;     // 周日
    daysHtml += `
      <div class="focus-day ${done ? 'done' : ''}" data-key="${key}" onclick="toggleDay('${key}')">
        <span class="check"></span>
        <div class="day-name">${d.day} ${fmtDate(dayDate)}</div>
        <div class="day-km">${d.km} km</div>
        <div style="font-size:11px;margin-top:4px;line-height:1.4">${detail}</div>
      </div>
    `;
  });

  const html = `
    <h3>本周聚焦 <span class="week-num">W${wk.wk}</span> · ${wk.start} · ${PHASES[wk.phase].name} · ${wk.note}</h3>
    <div class="focus-grid">${daysHtml}</div>
    <p style="font-size:11.5px;color:var(--muted);margin-top:10px">
      点击格子标记完成 (本地保存,刷新页面不丢) · 周总量 <b>${wk.vol} km</b>
    </p>
  `;
  document.getElementById('focus-week').innerHTML = html;
}

function toggleDay(key) {
  progress[key] = !progress[key];
  if (!progress[key]) delete progress[key];
  saveProgress();
  renderFocusWeek();
  renderHero();
  renderWeeks();
}

// ===== Profile =====
function renderProfile() {
  const cards = [
    { label: '年龄/性别', stat: RUNNER.age, unit: RUNNER.gender },
    { label: '身高/体重', stat: `${RUNNER.height} / ${RUNNER.weight}`, unit: `cm / kg · BMI ${RUNNER.bmi}` },
    { label: '训练史', stat: RUNNER.trainingYears, unit: '年' },
    { label: '周量', stat: RUNNER.weeklyKm, unit: 'km' },
    { label: '当前 PB', stat: RUNNER.currentPB, unit: RUNNER.pbRace },
    { label: '目标', stat: RUNNER.goal, unit: '配速 ' + RUNNER.goalPace },
    { label: 'VDOT', stat: `${RUNNER.vdotCurrent} → ${RUNNER.vdotTarget}`, unit: '+1 等级' },
    { label: '核心瓶颈', stat: '<span style="font-size:13px;color:var(--accent)">强度训练 0%</span>', unit: 'T+I+MP 全未开' },
  ];
  document.getElementById('profile-grid').innerHTML = cards.map(c => `
    <div class="card">
      <h4>${c.label}</h4>
      <div class="stat">${c.stat}<span class="unit">${c.unit}</span></div>
    </div>
  `).join('');
}

// ===== History =====
function renderHistory() {
  const rows = HISTORY.map(r => `
    <tr>
      <td>${r.name}</td><td>${r.date}</td><td>${r.time}</td>
      <td>${r.pace}</td><td>${r.hr}</td><td>${r.vi}%</td>
      <td style="color:${r.drift > 0 ? 'var(--accent)' : 'var(--green)'}">${r.drift > 0 ? '+' : ''}${r.drift} s/km</td>
    </tr>
  `).join('');
  document.getElementById('history-tbody').innerHTML = rows;
}

// ===== Charts =====
function renderCharts() {
  if (typeof Chart === 'undefined') return;

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#ddd' : '#333';
  const gridColor = isDark ? '#333' : '#e5e5e5';

  Chart.defaults.color = textColor;
  Chart.defaults.borderColor = gridColor;

  // Chart 1: 5km segment comparison
  const segCtx = document.getElementById('chart-segments');
  if (segCtx) {
    chartInstances.segments = new Chart(segCtx, {
      type: 'line',
      data: {
        labels: SEGMENTS.labels,
        datasets: Object.entries(SEGMENTS.races).map(([name, paces], i) => ({
          label: name,
          data: paces,
          borderColor: ['#b91c1c', '#b45309', '#16a34a', '#2563eb'][i],
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.3,
          pointRadius: 4,
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: '4 场全马 5km 分段配速对比 (秒/km)', font: { size: 14, weight: 'bold' }},
          legend: { position: 'top' }
        },
        scales: {
          y: {
            title: { display: true, text: '配速 (秒/km, 越低越快)' },
            ticks: { callback: (v) => secToPace(v) + '/km' },
            grid: { color: gridColor }
          },
          x: {
            title: { display: true, text: '5km 分段' },
            grid: { color: gridColor }
          }
        }
      }
    });
  }

  // Chart 2: weekly volume
  const volCtx = document.getElementById('chart-volume');
  if (volCtx) {
    chartInstances.volume = new Chart(volCtx, {
      type: 'bar',
      data: {
        labels: WEEKS.map(w => 'W' + w.wk),
        datasets: [{
          label: '周量 (km)',
          data: WEEKS.map(w => w.vol),
          backgroundColor: WEEKS.map(w => {
            if (w.race) return '#b91c1c';
            if (w.key) return '#b45309';
            if (w.cutback) return '#9ca3af';
            return ({ base1: '#22c55e', base2: '#3b82f6', build: '#f59e0b', race: '#ef4444', taper: '#a855f7' })[w.phase];
          }),
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: '22 周训练量分布', font: { size: 14, weight: 'bold' }},
          legend: { display: false }
        },
        scales: {
          y: {
            title: { display: true, text: 'km' },
            grid: { color: gridColor }
          },
          x: { grid: { color: gridColor } }
        }
      }
    });
  }

  // Chart 3: history bar
  const histCtx = document.getElementById('chart-history');
  if (histCtx) {
    chartInstances.history = new Chart(histCtx, {
      type: 'bar',
      data: {
        labels: HISTORY.map(h => h.name),
        datasets: [
          {
            label: '成绩 (秒)',
            data: HISTORY.map(h => h.seconds),
            backgroundColor: '#b91c1c',
            yAxisID: 'y',
          },
          {
            label: '均HR (bpm)',
            data: HISTORY.map(h => h.hr),
            type: 'line',
            borderColor: '#2563eb',
            backgroundColor: 'transparent',
            yAxisID: 'y1',
            borderWidth: 2,
            pointRadius: 5,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: '4 场全马: 成绩 + 均HR', font: { size: 14, weight: 'bold' }},
        },
        scales: {
          y: {
            position: 'left',
            title: { display: true, text: '成绩 (秒)' },
            min: 10650,
            ticks: { callback: (v) => {
              const h = Math.floor(v / 3600);
              const m = Math.floor((v % 3600) / 60);
              const s = v % 60;
              return `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
            }},
            grid: { color: gridColor }
          },
          y1: {
            position: 'right',
            title: { display: true, text: 'HR (bpm)' },
            grid: { drawOnChartArea: false },
            min: 155, max: 175,
          }
        }
      }
    });
  }
}

// ===== Weeks Table =====
function renderWeeks() {
  const curWk = getCurrentWeek();
  const container = document.getElementById('weeks-container');
  const grouped = {};
  WEEKS.forEach(w => {
    if (!grouped[w.phase]) grouped[w.phase] = [];
    grouped[w.phase].push(w);
  });

  let html = '';
  Object.entries(grouped).forEach(([phaseKey, weeks]) => {
    const phase = PHASES[phaseKey];
    html += `
      <div class="phase-header">
        <span class="name">${phase.name}</span>
        <span class="span">${phase.range} · ${phase.desc}</span>
      </div>
      <table class="week-table">
        <thead><tr>
          <th style="width:80px">完成</th>
          <th>周</th><th>起始日</th><th>总量</th>
          <th>周三主课 (21.2 km)</th>
          <th>周日长跑 (37 km)</th>
          <th>备注</th>
        </tr></thead>
        <tbody>
    `;
    weeks.forEach(w => {
      const weekKeys = Array.from({length: 6}, (_, i) => `w${w.wk}d${i}`);
      const doneCount = weekKeys.filter(k => progress[k]).length;
      const allDone = doneCount === 6;
      const classes = [];
      if (w.cutback) classes.push('cutback');
      if (w.key) classes.push('key');
      if (w.race) classes.push('race');
      if (w.wk === curWk) classes.push('current');
      if (allDone) classes.push('completed');
      html += `
        <tr class="${classes.join(' ')}" onclick="openWeekModal(${w.wk})">
          <td onclick="event.stopPropagation()">
            <span class="week-row-check ${allDone ? 'checked' : ''}" onclick="toggleWeek(${w.wk}); event.stopPropagation();"></span>
            <span style="font-family:ui-monospace,monospace;font-size:11px;color:var(--muted)">${doneCount}/6</span>
          </td>
          <td class="wk">W${w.wk}</td>
          <td class="date">${w.start.slice(5)}</td>
          <td class="vol">${w.vol}</td>
          <td class="workout">${w.wednesday}</td>
          <td class="workout">${w.sunday}</td>
          <td>${w.note}</td>
        </tr>
      `;
    });
    html += `</tbody></table>`;
  });
  container.innerHTML = html;
}

function toggleWeek(wkNum) {
  const weekKeys = Array.from({length: 6}, (_, i) => `w${wkNum}d${i}`);
  const allDone = weekKeys.every(k => progress[k]);
  weekKeys.forEach(k => {
    if (allDone) delete progress[k];
    else progress[k] = true;
  });
  saveProgress();
  renderFocusWeek();
  renderHero();
  renderWeeks();
}

// ===== Week modal =====
function openWeekModal(wkNum) {
  const wk = WEEKS[wkNum - 1];
  const wkStart = new Date(wk.start + 'T00:00:00+08:00');

  let daysHtml = '';
  WEEK_FRAME.forEach((d, i) => {
    const dayDate = new Date(wkStart.getTime() + i * 24 * 60 * 60 * 1000);
    const key = `w${wk.wk}d${i}`;
    let detail = d.detail;
    if (i === 2) detail = wk.wednesday;
    if (i === 6) detail = wk.sunday;
    daysHtml += `
      <div class="modal-day">
        <div class="head">
          <span class="day-label">
            <input type="checkbox" ${progress[key] ? 'checked' : ''} onchange="toggleDay('${key}')">
            ${d.day} · ${fmtDate(dayDate)}
          </span>
          <span class="day-km">${d.km} km</span>
        </div>
        <div>${detail}</div>
      </div>
    `;
  });

  // 日志区: 主课 (周三 + 周日)
  const logsHtml = LOG_SLOTS.map(s => renderLogEditor(wk.wk, s.slot, s.label)).join('');

  document.getElementById('modal-body').innerHTML = `
    <h3>W${wk.wk} · ${wk.start} · ${PHASES[wk.phase].name}</h3>
    <p style="color:var(--muted);font-size:13px">总量 <b>${wk.vol} km</b> · ${wk.note}</p>
    <div class="modal-days">${daysHtml}</div>
    <div class="log-zone">
      <h4 style="margin:18px 0 8px;font-size:14px;color:var(--accent)">📓 训练日志 · 主课记录</h4>
      ${logsHtml}
    </div>
  `;
  document.getElementById('week-modal').classList.add('active');
}

// ===== Training log editor =====
function renderLogEditor(wkNum, slot, label) {
  const key = `w${wkNum}_${slot}`;
  const data = logs[key] || {};
  const rpe = data.rpe || 6;
  const rpeColor = rpe <= 4 ? '#16a34a' : rpe <= 7 ? '#b45309' : '#b91c1c';
  return `
    <div class="log-card">
      <div class="log-head">
        <span class="log-slot">${label}</span>
        <span class="log-saved">${data.savedAt ? '已保存 ' + data.savedAt : ''}</span>
      </div>
      <div class="log-row">
        <label>RPE (主观努力度)</label>
        <div class="rpe-row">
          <input type="range" min="1" max="10" value="${rpe}" id="log-rpe-${key}"
                 oninput="document.getElementById('log-rpe-val-${key}').textContent = this.value + (this.value<=4?' 轻松':this.value<=7?' 中等':' 极限')" />
          <span class="rpe-val" id="log-rpe-val-${key}" style="color:${rpeColor};font-weight:600">${rpe}${rpe<=4?' 轻松':rpe<=7?' 中等':' 极限'}</span>
        </div>
      </div>
      <div class="log-row">
        <label>主观感受</label>
        <input type="text" id="log-feel-${key}" value="${(data.feel||'').replace(/"/g,'&quot;')}" placeholder="例如: 腿沉但能维持 / 轻松 / 末段掉速" />
      </div>
      <div class="log-row">
        <label>实际完成</label>
        <input type="text" id="log-actual-${key}" value="${(data.actual||'').replace(/"/g,'&quot;')}" placeholder="例如: 8km @ 3:58 avgHR 168 / 计划完成" />
      </div>
      <div class="log-row">
        <label>心得复盘</label>
        <textarea id="log-notes-${key}" rows="3" placeholder="反思: 配速控制 / 补给 / 装备 / 天气 / 身体反馈 / 下次调整">${(data.notes||'')}</textarea>
      </div>
      <div class="log-row">
        <label>天气 (可选)</label>
        <input type="text" id="log-weather-${key}" value="${(data.weather||'').replace(/"/g,'&quot;')}" placeholder="例如: 晴 26°C 微风" />
      </div>
      <div class="log-actions">
        <button class="icon-btn primary" onclick="saveLog('${key}')">💾 保存日志</button>
        ${data.savedAt ? `<button class="icon-btn" onclick="deleteLog('${key}')">删除</button>` : ''}
      </div>
    </div>
  `;
}

function saveLog(key) {
  const rpe = parseInt(document.getElementById(`log-rpe-${key}`).value);
  const feel = document.getElementById(`log-feel-${key}`).value.trim();
  const actual = document.getElementById(`log-actual-${key}`).value.trim();
  const notes = document.getElementById(`log-notes-${key}`).value.trim();
  const weather = document.getElementById(`log-weather-${key}`).value.trim();
  if (!feel && !actual && !notes) {
    alert('请至少填写一个字段 (感受 / 实际完成 / 心得)');
    return;
  }
  logs[key] = {
    rpe, feel, actual, notes, weather,
    savedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
  };
  saveLogs();
  // Re-render to show savedAt and refresh log section
  const wkMatch = key.match(/^w(\d+)_/);
  if (wkMatch) openWeekModal(parseInt(wkMatch[1]));
  renderLogSection();
}

function deleteLog(key) {
  if (!confirm('删除这条日志? 不可撤销。')) return;
  delete logs[key];
  saveLogs();
  const wkMatch = key.match(/^w(\d+)_/);
  if (wkMatch) openWeekModal(parseInt(wkMatch[1]));
  renderLogSection();
}

// ===== Log section (timeline) =====
function renderLogSection() {
  const container = document.getElementById('log-timeline');
  if (!container) return;
  const entries = Object.entries(logs).sort((a, b) => {
    const am = a[0].match(/^w(\d+)_(wed|sun)/);
    const bm = b[0].match(/^w(\d+)_(wed|sun)/);
    if (!am || !bm) return 0;
    const aw = parseInt(am[1]), bw = parseInt(bm[1]);
    if (aw !== bw) return bw - aw;
    return am[2] === 'sun' ? -1 : 1;
  });

  if (entries.length === 0) {
    container.innerHTML = '<p style="color:var(--muted);font-size:13px">还没有日志。点击下方任意训练周可在 modal 内填写主课感受。</p>';
    return;
  }

  let html = `<p style="color:var(--muted);font-size:12px">共 ${entries.length} 条主课日志, 按时间倒序</p>`;
  entries.forEach(([key, data]) => {
    const m = key.match(/^w(\d+)_(wed|sun)/);
    if (!m) return;
    const wk = WEEKS[parseInt(m[1]) - 1];
    const slot = m[2] === 'wed' ? '周三' : '周日';
    const slotLabel = m[2] === 'wed' ? '质量课' : '长跑';
    const detail = m[2] === 'wed' ? wk.wednesday : wk.sunday;
    const rpeColor = data.rpe <= 4 ? '#16a34a' : data.rpe <= 7 ? '#b45309' : '#b91c1c';
    html += `
      <div class="log-entry">
        <div class="log-entry-head">
          <span class="log-entry-wk">W${m[1]} · ${slot}${slotLabel} · ${PHASES[wk.phase].name}</span>
          <span class="log-entry-meta">
            <span style="background:${rpeColor};color:#fff;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:600">RPE ${data.rpe}</span>
            <span style="color:var(--muted);font-size:11px;margin-left:8px">${data.savedAt || ''}</span>
          </span>
        </div>
        <div class="log-entry-plan">${detail}</div>
        ${data.actual ? `<div class="log-entry-actual"><b>实际:</b> ${data.actual}</div>` : ''}
        ${data.feel ? `<div class="log-entry-feel"><b>感受:</b> ${data.feel}</div>` : ''}
        ${data.notes ? `<div class="log-entry-notes"><b>心得:</b> ${data.notes.replace(/\n/g, '<br>')}</div>` : ''}
        ${data.weather ? `<div class="log-entry-weather">🌤 ${data.weather}</div>` : ''}
        <div class="log-entry-actions">
          <button class="icon-btn" onclick="openWeekModal(${m[1]})">编辑</button>
          <button class="icon-btn" onclick="deleteLog('${key}')">删除</button>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}
function closeModal() {
  document.getElementById('week-modal').classList.remove('active');
}

// ===== Strength =====
function renderStrength() {
  function exTable(ses) {
    return `
      <h3>${ses.name}</h3>
      <p style="font-size:12px;color:var(--muted)">总时长 ~${ses.duration} min · 重点: ${ses.focus}</p>
      <table>
        <thead><tr><th>动作</th><th>组×次</th><th>强度</th></tr></thead>
        <tbody>${ses.exercises.map(e => `<tr><td>${e.name}</td><td>${e.sets}</td><td>${e.intensity}</td></tr>`).join('')}</tbody>
      </table>
    `;
  }
  const perTable = `
    <h3>渐进周期</h3>
    <table><thead><tr><th>训练周</th><th>力量阶段</th><th>强度</th><th>目标</th></tr></thead>
    <tbody>${STRENGTH.periodization.map(p => `<tr><td>${p.wk}</td><td>${p.phase}</td><td>${p.intensity}</td><td>${p.goal}</td></tr>`).join('')}</tbody></table>
  `;
  document.getElementById('strength-content').innerHTML = `
    <div class="grid-2">
      <div>${exTable(STRENGTH.session1)}</div>
      <div>${exTable(STRENGTH.session2)}</div>
    </div>
    ${perTable}
  `;
}

// ===== Race strategy =====
function renderRaceStrategy() {
  const segs = RACE_STRATEGY.segments.map(s => `<tr><td>${s.name}</td><td>${s.range}</td><td>${s.pace}</td><td>${s.cumulative}</td></tr>`).join('');
  const fuel = RACE_STRATEGY.fueling.map(f => `<tr><td>${f.time}</td><td>${f.item}</td><td>${f.qty}</td></tr>`).join('');
  document.getElementById('race-strategy').innerHTML = `
    <div class="grid-2">
      <div>
        <h3>配速分段 (目标 2:54:30)</h3>
        <table><thead><tr><th>段</th><th>距离</th><th>配速</th><th>累计</th></tr></thead><tbody>${segs}</tbody></table>
      </div>
      <div>
        <h3>补给计划</h3>
        <table><thead><tr><th>时间</th><th>项目</th><th>量</th></tr></thead><tbody>${fuel}</tbody></table>
      </div>
    </div>
  `;
}

// ===== Milestones =====
function renderMilestones() {
  const rows = MILESTONES.map(m => `<tr><td>${m.date}</td><td>${m.label}</td><td>${m.desc}</td></tr>`).join('');
  document.getElementById('milestones-tbody').innerHTML = rows;
}

// ===== Pace calculator (Jack Daniels VDOT-ish) =====
function calculatePaces() {
  const input = document.getElementById('target-time').value;
  const m = input.match(/(\d+):(\d{2}):(\d{2})/);
  if (!m) {
    alert('格式: H:MM:SS, 例如 2:54:30');
    return;
  }
  const totalSec = parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseInt(m[3]);
  const mp = totalSec / 42.195;  // sec/km

  // Simplified factor-based estimates (relative to MP) — VDOT 目标
  const e = mp * 1.18;          // ~+18%
  const eSlow = mp * 1.23;
  const t = mp * 0.95;          // ~-5%  目标 ~3:56
  const i = mp * 0.87;          // ~-13% 目标 ~3:36
  const r = mp * 0.83;          // ~-17% 目标 ~3:26

  // 当前起步 (ease-in) — 用户偏好「信心优先」: 先从 4:05 起步, 完全无压力后每次降 5 秒进下一档。
  // (依据: 5/23 实测 1km 3:55 @ HR158, 上限远高于此; 4:05 是低压力的节奏建立档)
  const tStart = mp * 0.987;    // ~4:05
  const iStart = mp * 0.987;    // ~4:05
  const rStart = mp * 0.927;    // ~3:50

  const html = `
    <table>
      <thead><tr><th>区间</th><th>当前起步</th><th>目标 (VDOT)</th><th>说明 / HR</th></tr></thead>
      <tbody>
        <tr><td>E (轻松)</td><td colspan="2" style="text-align:center">${secToPace(e)}</td><td>HR ≤145</td></tr>
        <tr><td>恢复</td><td colspan="2" style="text-align:center">${secToPace(eSlow)}</td><td>HR ≤140, 周四 (更慢更短)</td></tr>
        <tr><td>M (马配)</td><td colspan="2" style="text-align:center"><b>${secToPace(mp)}</b></td><td>目标比赛配速, HR ~160</td></tr>
        <tr><td>T (阈值)</td><td><b>${secToPace(tStart)}</b></td><td>${secToPace(t)}</td><td>HR 168-175 · 先敢上心率</td></tr>
        <tr><td>I (间歇)</td><td><b>${secToPace(iStart)}</b></td><td>${secToPace(i)}</td><td>VO2max, HR ~max-5</td></tr>
        <tr><td>R (短距)</td><td><b>${secToPace(rStart)}</b></td><td>${secToPace(r)}</td><td>200-400m + strides</td></tr>
      </tbody>
    </table>
    <p style="font-size:11px;color:var(--muted);margin-top:8px">
      <b>策略 · 信心优先</b>: 先从<b>当前起步 (4:05)</b> 建立分组跑的节奏,完全无压力后每次降 5 秒
      (4:05 → 4:00 → 3:55 …) 逐步逼近<b>目标</b>列;到 3:55 往下,心率会自然进 168+。
      (依据 5/23 实测: 1km 3:55 @ HR158, 上限远高于 4:00) · 精确版可用
      <a href="https://runsmart.in/calculators/vdot/" target="_blank">VDOT 计算器</a>
    </p>
  `;
  document.getElementById('pace-result').innerHTML = html;
}

// ===== Bindings =====
function bindEvents() {
  document.getElementById('print-btn').addEventListener('click', () => window.print());
  document.getElementById('theme-btn').addEventListener('click', toggleTheme);
  document.getElementById('reset-btn').addEventListener('click', () => {
    const choice = confirm('重置训练完成记录? (确定) 或一并清空日志? (取消后再点 Shift+确定)');
    if (choice) {
      progress = {};
      saveProgress();
      if (confirm('日志也要清空吗? 此操作不可撤销。')) {
        logs = {};
        saveLogs();
      }
      renderFocusWeek();
      renderHero();
      renderWeeks();
      renderLogSection();
    }
  });
  document.getElementById('export-btn').addEventListener('click', () => {
    const bundle = { progress, logs, exportedAt: new Date().toISOString() };
    const data = JSON.stringify(bundle, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tjm2026-progress-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  });

  const calcBtn = document.getElementById('calc-btn');
  if (calcBtn) calcBtn.addEventListener('click', calculatePaces);

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('week-modal').addEventListener('click', (e) => {
    if (e.target.id === 'week-modal') closeModal();
  });

  // Quick scroll-to from initial pace calc
  setTimeout(calculatePaces, 200);
}

// Expose for inline handlers
window.toggleDay = toggleDay;
window.toggleWeek = toggleWeek;
window.openWeekModal = openWeekModal;
window.closeModal = closeModal;
window.saveLog = saveLog;
window.deleteLog = deleteLog;
