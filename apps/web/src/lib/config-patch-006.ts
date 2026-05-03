// 🔹 ПАТЧ 6: Координатор стилей и тем (конструктор)
export const GLOBAL_THEME_STYLES = `
:root{--bg:#1a1a2e;--text:#f0f0f0;--accent:#fdcb6e;--card:#16213e;--border:#0f3460;--success:#00b894;--error:#e94560}
button{font-family:inherit;cursor:pointer;border:none;border-radius:8px;background:var(--accent);color:#000;padding:10px 20px;font-weight:600}
button:hover:not(:disabled){filter:brightness(1.1);transform:translateY(-1px)}
input,select,textarea{font-family:inherit;background:var(--card);color:var(--text);border:1px solid var(--border);border-radius:6px;padding:8px;width:100%}
[data-theme='sunny']{--bg:#ffecd2;--text:#2d3436;--accent:#fdcb6e;--card:#fff9c4}
[data-theme='coral']{--bg:#ff9a9e;--text:#fff;--accent:#ff6b6b;--card:#ffb3ba}
[data-theme='mint']{--bg:#a8e6cf;--text:#2d3436;--accent:#00b894;--card:#dcedc1}
[data-theme='sky']{--bg:#89f7fe;--text:#2d3436;--accent:#3498db;--card:#bae8e8}
[data-theme='lavender']{--bg:#e0c3fc;--text:#2d3436;--accent:#8e44ad;--card:#f3e5f5}
[data-theme='peach']{--bg:#ffd1ff;--text:#2d3436;--accent:#e91e63;--card:#f8bbd0}
[data-theme='lime']{--bg:#d4fc79;--text:#2d3436;--accent:#2ecc71;--card:#c8e6c9}
[data-theme='violet']{--bg:#fa709a;--text:#fff;--accent:#9b59b6;--card:#e1bee7}
`;

export function applyThemeCoordinator() {
  if (typeof document === 'undefined') return;
  let style = document.getElementById('c4c-theme-coordinator');
  if (!style) {
    style = document.createElement('style');
    style.id = 'c4c-theme-coordinator';
    document.head.appendChild(style);
  }
  style.textContent = GLOBAL_THEME_STYLES;
}

export const PATCH_006 = { GLOBAL_THEME_STYLES, applyThemeCoordinator };
