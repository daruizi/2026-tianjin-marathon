// 客户端访问控制 — PBKDF2-SHA256 密码门
// 注意: GitHub Pages 无服务端, 客户端鉴权仅能阻挡非技术用户
// 真正安全需 GitHub Pro (private Pages) 或 Cloudflare Access

const AUTH_CONFIG = {
  // 修改密码: 在浏览器控制台运行 generateHash('新密码') 得到新 hash, 替换下方 PASSWORD_HASH 后 git push
  SALT: '2026-tjm-jerry-static-salt-v1',
  ITERATIONS: 250000,
  PASSWORD_HASH: '8XNI9aiexxX1gA/LSYgiIM/STEw8kU/PCoGn2p41FFo=',  // 默认: Jerry-TJM-2026-go (立即改!)
  SESSION_KEY: 'shm-auth-token-v1',
  SESSION_TTL_MS: 30 * 24 * 60 * 60 * 1000,  // 30 天免登录
};

async function pbkdf2Hash(password) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(AUTH_CONFIG.SALT),
      iterations: AUTH_CONFIG.ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial, 256
  );
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

// 暴露到 console 用于生成新密码 hash (改密码时用)
window.generateHash = async function(password) {
  const hash = await pbkdf2Hash(password);
  console.log('%c=== 新密码 Hash ===', 'color:#b91c1c;font-weight:bold');
  console.log('Salt:', AUTH_CONFIG.SALT);
  console.log('Hash:', hash);
  console.log('%c请将 Hash 复制粘贴到 auth.js 的 PASSWORD_HASH 行, 然后 git push', 'color:#b45309');
  return hash;
};

function getAuthState() {
  try {
    const raw = sessionStorage.getItem(AUTH_CONFIG.SESSION_KEY);
    if (!raw) {
      // 同时尝试 localStorage (持久登录 30 天)
      const persistent = localStorage.getItem(AUTH_CONFIG.SESSION_KEY);
      if (!persistent) return null;
      const data = JSON.parse(persistent);
      if (data.expiresAt && data.expiresAt > Date.now()) return data;
      localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
      return null;
    }
    return JSON.parse(raw);
  } catch (e) { return null; }
}

function isAuthenticated() {
  const state = getAuthState();
  return !!(state && state.token && state.expiresAt > Date.now());
}

function setAuthenticated(remember) {
  const data = {
    token: '1',
    authedAt: Date.now(),
    expiresAt: Date.now() + (remember ? AUTH_CONFIG.SESSION_TTL_MS : 24 * 60 * 60 * 1000)
  };
  if (remember) {
    localStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify(data));
  } else {
    sessionStorage.setItem(AUTH_CONFIG.SESSION_KEY, JSON.stringify(data));
  }
}

function logout() {
  sessionStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
  localStorage.removeItem(AUTH_CONFIG.SESSION_KEY);
  showAuthGate();
}

async function tryAuthenticate(password, remember) {
  if (!password) return false;
  const hash = await pbkdf2Hash(password);
  if (hash === AUTH_CONFIG.PASSWORD_HASH) {
    setAuthenticated(remember);
    return true;
  }
  return false;
}

function showAuthGate() {
  document.body.setAttribute('data-auth', 'locked');
  if (document.getElementById('auth-gate')) return;
  const gate = document.createElement('div');
  gate.id = 'auth-gate';
  gate.innerHTML = `
    <div class="auth-box">
      <div class="auth-icon">🔒</div>
      <h2>2026 天津马拉松训练计划</h2>
      <p class="auth-sub">sub 2:55 备战 · 私有访问</p>
      <form id="auth-form" onsubmit="handleAuth(event)">
        <input type="password" id="auth-pwd" placeholder="访问密码" autofocus autocomplete="current-password" />
        <label class="auth-remember">
          <input type="checkbox" id="auth-remember" checked />
          <span>记住此设备 30 天</span>
        </label>
        <button type="submit" id="auth-btn">解锁</button>
        <div id="auth-error"></div>
      </form>
      <p class="auth-hint">忘记密码请联系站点所有者 · GitHub 仓库代码公开但内容受保护</p>
    </div>
  `;
  document.body.appendChild(gate);
  // Focus password input
  setTimeout(() => {
    const inp = document.getElementById('auth-pwd');
    if (inp) inp.focus();
  }, 100);
}

function hideAuthGate() {
  document.body.removeAttribute('data-auth');
  const gate = document.getElementById('auth-gate');
  if (gate) gate.remove();
}

async function handleAuth(e) {
  e.preventDefault();
  const pwd = document.getElementById('auth-pwd').value;
  const remember = document.getElementById('auth-remember').checked;
  const btn = document.getElementById('auth-btn');
  const err = document.getElementById('auth-error');
  btn.disabled = true;
  btn.textContent = '验证中...';
  err.textContent = '';

  // 加点延迟防暴力 (除了 PBKDF2 本身慢)
  await new Promise(r => setTimeout(r, 200));

  const ok = await tryAuthenticate(pwd, remember);
  if (ok) {
    hideAuthGate();
    // 通知 app 重新初始化
    if (typeof onAuthSuccess === 'function') onAuthSuccess();
    location.reload();  // 简单粗暴: 重载页面让所有 init 重新跑
  } else {
    btn.disabled = false;
    btn.textContent = '解锁';
    err.textContent = '密码错误';
    document.getElementById('auth-pwd').value = '';
    document.getElementById('auth-pwd').focus();
  }
}

// 立即检查认证状态 (在 body 解析前阻止显示)
(function gateCheck() {
  if (!isAuthenticated()) {
    // 在 head 阶段就给 documentElement 设标记, CSS 立刻隐藏内容
    if (document.documentElement) {
      document.documentElement.setAttribute('data-auth', 'locked');
    }
    // body 解析后挂载门
    if (document.body) {
      showAuthGate();
    } else {
      document.addEventListener('DOMContentLoaded', showAuthGate);
    }
  }
})();

// Expose
window.handleAuth = handleAuth;
window.logout = logout;
window.isAuthenticated = isAuthenticated;
