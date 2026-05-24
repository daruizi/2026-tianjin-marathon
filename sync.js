// 跨设备同步 — 使用 GitHub Gist API
// 数据存在用户私有 Gist, 多设备通过同一个 PAT 同步

const SYNC_CONFIG_KEY = 'shm2026-sync-config';
const GIST_DESCRIPTION = '2026 TJM Training Progress (DO NOT DELETE)';
const GIST_FILENAME = 'training-data.json';
const SYNC_DEBOUNCE_MS = 2000;  // 数据变更后 2 秒推送

let syncConfig = loadSyncConfig();
let syncDebounceTimer = null;
let syncing = false;

function loadSyncConfig() {
  try {
    return JSON.parse(localStorage.getItem(SYNC_CONFIG_KEY) || '{}');
  } catch (e) { return {}; }
}
function saveSyncConfig() {
  localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(syncConfig));
}

function isSyncEnabled() {
  return !!(syncConfig.pat && syncConfig.gistId);
}

// ===== GitHub API helpers =====
async function ghApi(path, opts = {}) {
  const headers = {
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...opts.headers,
  };
  if (syncConfig.pat) headers['Authorization'] = `Bearer ${syncConfig.pat}`;
  const res = await fetch(`https://api.github.com${path}`, { ...opts, headers });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`GitHub API ${res.status}: ${txt.slice(0, 200)}`);
  }
  return res.json();
}

async function findOrCreateGist() {
  // 列出用户 Gists, 找 description 匹配的
  const gists = await ghApi('/gists?per_page=100');
  const existing = gists.find(g => g.description === GIST_DESCRIPTION);
  if (existing) return existing.id;
  // 创建新 Gist
  const created = await ghApi('/gists', {
    method: 'POST',
    body: JSON.stringify({
      description: GIST_DESCRIPTION,
      public: false,
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify({ progress: {}, logs: {}, lastUpdated: new Date().toISOString() }, null, 2)
        }
      }
    })
  });
  return created.id;
}

async function pullRemote() {
  if (!isSyncEnabled()) throw new Error('Sync not configured');
  const gist = await ghApi(`/gists/${syncConfig.gistId}`);
  const file = gist.files[GIST_FILENAME];
  if (!file) throw new Error(`Gist file ${GIST_FILENAME} missing`);
  return JSON.parse(file.content);
}

async function pushRemote(data) {
  if (!isSyncEnabled()) throw new Error('Sync not configured');
  await ghApi(`/gists/${syncConfig.gistId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      files: {
        [GIST_FILENAME]: {
          content: JSON.stringify(data, null, 2)
        }
      }
    })
  });
}

// ===== Merge strategy =====
// progress: union (任一端为 true 即 true) — 完成状态不应丢失
// logs: per-key 按 savedAt 取较新者
function mergeData(local, remote) {
  const merged = {
    progress: { ...remote.progress, ...local.progress },
    logs: {},
    lastUpdated: new Date().toISOString(),
  };
  const allKeys = new Set([...Object.keys(local.logs || {}), ...Object.keys(remote.logs || {})]);
  for (const k of allKeys) {
    const l = local.logs?.[k];
    const r = remote.logs?.[k];
    if (l && r) {
      // 取 savedAt 较新者
      merged.logs[k] = (l.savedAt || '') >= (r.savedAt || '') ? l : r;
    } else {
      merged.logs[k] = l || r;
    }
  }
  return merged;
}

// ===== Public API =====
async function syncNow(silent = false) {
  if (!isSyncEnabled()) {
    if (!silent) alert('同步未配置,请点击"☁ 同步"配置');
    return false;
  }
  if (syncing) return false;
  syncing = true;
  updateSyncStatus('syncing');
  try {
    const remote = await pullRemote();
    const local = {
      progress: window.progress || {},
      logs: window.logs || {},
      lastUpdated: syncConfig.lastSync || '1970-01-01T00:00:00Z',
    };
    const merged = mergeData(local, remote);
    // 写入远程
    await pushRemote(merged);
    // 写入本地
    window.progress = merged.progress;
    window.logs = merged.logs;
    localStorage.setItem('shm2026-progress-v1', JSON.stringify(merged.progress));
    localStorage.setItem('shm2026-logs-v1', JSON.stringify(merged.logs));
    syncConfig.lastSync = merged.lastUpdated;
    saveSyncConfig();
    updateSyncStatus('ok', merged.lastUpdated);
    if (!silent && typeof renderFocusWeek === 'function') {
      renderFocusWeek();
      renderHero();
      renderWeeks();
      renderLogSection();
    }
    return true;
  } catch (e) {
    console.error('Sync failed:', e);
    updateSyncStatus('error', e.message);
    if (!silent) alert('同步失败: ' + e.message);
    return false;
  } finally {
    syncing = false;
  }
}

// 数据修改后, 防抖触发同步
function triggerSync() {
  if (!isSyncEnabled()) return;
  if (syncDebounceTimer) clearTimeout(syncDebounceTimer);
  syncDebounceTimer = setTimeout(() => {
    syncNow(true);
  }, SYNC_DEBOUNCE_MS);
}

// ===== Config UI =====
function openSyncModal() {
  const enabled = isSyncEnabled();
  const html = `
    <div class="modal-overlay active" id="sync-modal" onclick="if(event.target.id==='sync-modal') closeSyncModal()">
      <div class="modal" style="max-width:560px">
        <button class="modal-close" onclick="closeSyncModal()">×</button>
        <h3>☁ 跨设备数据同步</h3>
        <p style="font-size:13px;color:var(--muted)">
          通过 GitHub Gist (私有, 仅你能访问) 同步训练进度和日志, 两台电脑用同一个 PAT 即可双向同步。
        </p>
        ${enabled ? `
          <div class="box ok" style="margin:14px 0">
            <b>✓ 同步已启用</b><br>
            Gist ID: <code style="font-size:11px">${syncConfig.gistId}</code><br>
            上次同步: ${syncConfig.lastSync ? new Date(syncConfig.lastSync).toLocaleString('zh-CN') : '未同步'}
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="icon-btn primary" onclick="syncNow(false).then(ok=>{if(ok)alert('同步成功')})">立即同步</button>
            <button class="icon-btn" onclick="disableSync()">取消同步</button>
          </div>
          <h4 style="margin-top:20px">在另一台设备上配置</h4>
          <p style="font-size:13px">在第二台设备打开本网站后, 点 "☁ 同步" → 粘贴<b>相同的 PAT</b> → 应用自动识别并关联同一个 Gist。</p>
        ` : `
          <div class="box info" style="margin:14px 0;font-size:13px">
            <b>三步开启同步</b>:
            <ol style="margin:6px 0;padding-left:20px">
              <li>在 GitHub 创建 PAT (Personal Access Token) <a href="https://github.com/settings/tokens?type=beta" target="_blank">→ 跳转</a><br>
                  <span style="color:var(--muted);font-size:12px">推荐 Fine-grained token · 只勾选 <b>Gists: Read and write</b> 权限</span></li>
              <li>把生成的 PAT (ghp_... 或 github_pat_...) 粘贴到下方</li>
              <li>点"开启同步", 应用会自动创建/关联私有 Gist</li>
            </ol>
          </div>
          <div class="log-row">
            <label>GitHub Personal Access Token</label>
            <input type="password" id="sync-pat-input" placeholder="ghp_... 或 github_pat_..." style="width:100%;padding:8px 10px;border:1px solid var(--line);border-radius:4px;background:var(--surface);color:var(--ink);font-family:ui-monospace,monospace" />
          </div>
          <div style="display:flex;gap:8px;margin-top:12px">
            <button class="icon-btn primary" onclick="enableSync()">开启同步</button>
            <button class="icon-btn" onclick="closeSyncModal()">取消</button>
          </div>
          <div class="warn" style="margin-top:14px;font-size:12px">
            <b>安全提示</b>:
            <ul style="margin:4px 0;padding-left:20px">
              <li>PAT 仅存在你浏览器的 localStorage, 不发送到任何第三方</li>
              <li>Gist 设置为 <b>Secret</b> (仅持 URL 者可访问)</li>
              <li>所有 API 调用直接到 GitHub, 没有中转</li>
              <li>建议用 Fine-grained token, 限定权限到 Gists</li>
            </ul>
          </div>
        `}
      </div>
    </div>
  `;
  const existing = document.getElementById('sync-modal');
  if (existing) existing.remove();
  document.body.insertAdjacentHTML('beforeend', html);
}

function closeSyncModal() {
  const m = document.getElementById('sync-modal');
  if (m) m.remove();
}

async function enableSync() {
  const input = document.getElementById('sync-pat-input');
  const pat = input.value.trim();
  if (!pat) {
    alert('请输入 PAT');
    return;
  }
  if (!pat.startsWith('ghp_') && !pat.startsWith('github_pat_')) {
    if (!confirm('PAT 格式异常 (通常以 ghp_ 或 github_pat_ 开头), 仍要继续吗?')) return;
  }
  // 临时存 PAT 用于测试
  syncConfig.pat = pat;
  updateSyncStatus('syncing');
  try {
    // 验证 PAT
    await ghApi('/user');
    // 找/建 Gist
    const gistId = await findOrCreateGist();
    syncConfig.gistId = gistId;
    saveSyncConfig();
    // 立即同步
    await syncNow(true);
    alert('同步已启用! Gist ID: ' + gistId);
    closeSyncModal();
    updateSyncStatus('ok', syncConfig.lastSync);
  } catch (e) {
    console.error('Enable sync failed:', e);
    syncConfig.pat = null;
    saveSyncConfig();
    alert('启用同步失败: ' + e.message + '\n\n请检查 PAT 是否有效, 是否赋予 Gists 读写权限');
    updateSyncStatus('error', e.message);
  }
}

function disableSync() {
  if (!confirm('取消同步? PAT 和 Gist 关联将从本设备移除 (Gist 本身不会删除)')) return;
  syncConfig = {};
  saveSyncConfig();
  updateSyncStatus('idle');
  closeSyncModal();
  alert('同步已取消');
}

function updateSyncStatus(status, info) {
  const btn = document.getElementById('sync-btn');
  if (!btn) return;
  const icons = { idle: '☁', syncing: '↻', ok: '✓', error: '⚠' };
  const titles = {
    idle: '同步未配置',
    syncing: '同步中...',
    ok: '上次同步 ' + (info ? new Date(info).toLocaleString('zh-CN') : ''),
    error: '同步失败: ' + (info || '')
  };
  btn.textContent = icons[status] + ' 同步';
  btn.title = titles[status];
  btn.classList.remove('sync-ok', 'sync-error', 'sync-syncing');
  if (status === 'ok') btn.classList.add('sync-ok');
  if (status === 'error') btn.classList.add('sync-error');
  if (status === 'syncing') btn.classList.add('sync-syncing');
}

// ===== Init =====
function initSync() {
  updateSyncStatus(isSyncEnabled() ? 'ok' : 'idle', syncConfig.lastSync);
  // 启动时拉一次远程, 合并本地
  if (isSyncEnabled()) {
    setTimeout(() => syncNow(true), 500);
  }
}

// Expose
window.syncNow = syncNow;
window.triggerSync = triggerSync;
window.openSyncModal = openSyncModal;
window.closeSyncModal = closeSyncModal;
window.enableSync = enableSync;
window.disableSync = disableSync;
window.initSync = initSync;
window.isSyncEnabled = isSyncEnabled;
