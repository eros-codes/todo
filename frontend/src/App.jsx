import { useEffect, useRef, useState } from "react";
import TodoList from "./TodoList";

export default function App() {
  // theme: 'light' | 'dark'
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('theme') || 'light' } catch { return 'light' }
  });

  const [themeVersion, setThemeVersion] = useState(0);

  const PALETTE = [
    { name: "white", value: "#ffffff" },
    { name: "green", value: "#22c55e" },
    { name: "blue", value: "#2b6ff7" },
    { name: "purple", value: "#a855f7" },
    { name: "pink", value: "#f7bdcd" },
    { name: "red", value: "#ef4444" },
    { name: "orange", value: "#fb923c" },
    { name: "brown", value: "#d2691e" },
  ];
  const PALETTE_DARK = [
    { name: "white", value: "#0b1116" },
    { name: "green", value: "#0f5130" },
    { name: "blue", value: "#112e6a" },
    { name: "purple", value: "#3b0f63" },
    { name: "pink", value: "#8b1450" },
    { name: "red", value: "#b91c1c" },
    { name: "orange", value: "#b54708" },
    { name: "brown", value: "#4b2e1a" },
  ];

  function rgbToHex(rgb) {
    try {
      const m = rgb.match(/rgba?\(([^)]+)\)/);
      if (!m) return rgb;
      const parts = m[1].split(',').map(p => parseFloat(p.trim()));
      const [r,g,b] = parts;
      return '#'+[r,g,b].map(x=>{
        const v = Math.round(x);
        return v.toString(16).padStart(2,'0');
      }).join('');
    } catch { return rgb }
  }

  function normalizeColorString(s){
    if (!s) return s;
    const str = String(s).trim().toLowerCase();
    if (str.startsWith('rgb')) return rgbToHex(str);
    return str;
  }

  function mapColorForTheme(col, toDark) {
    try {
      const norm = normalizeColorString(col);
      let idx = PALETTE.findIndex(p => p.value.toLowerCase() === norm || p.name.toLowerCase() === norm);
      if (idx !== -1) return toDark ? PALETTE_DARK[idx].value : PALETTE[idx].value;
      idx = PALETTE_DARK.findIndex(p => p.value.toLowerCase() === norm || p.name.toLowerCase() === norm);
      if (idx !== -1) return toDark ? PALETTE_DARK[idx].value : PALETTE[idx].value;
      return col;
    } catch { return col }
  }

  

  const [categories, setCategories] = useState(() => {
    try {
      const raw = localStorage.getItem("todo-categories");
      return raw
        ? JSON.parse(raw)
        : [
            { id: "c1", title: "Personal", storageKey: "todo-personal" },
            { id: "c2", title: "Work", storageKey: "todo-work" },
          ];
    } catch {
      return [
        { id: "c1", title: "Personal", storageKey: "todo-personal" },
        { id: "c2", title: "Work", storageKey: "todo-work" },
      ];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("todo-categories", JSON.stringify(categories));
    } catch {}
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
    } catch {}
    try {
      document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : '');
    } catch {}

    // Update PWA manifest and favicons to match theme (light/dark).
    // Replace existing <link> elements (remove + recreate) and append a cache-busting query so browsers pick up the new files.
    try {
      const baseRaw = (import.meta.env.BASE_URL || './');
      const base = String(baseRaw).replace(/\/$/, '') + '/';
      const head = document.head;
      const ts = Date.now();

      // helper to remove existing links by selector
      const removeAll = (sel) => {
        document.querySelectorAll(sel).forEach(n => n.remove());
      };

      // remove old icons and apple-touch-icon
      removeAll('link[rel~="icon"]');
      removeAll('link[rel="apple-touch-icon"]');

      // create and append icon links (192, 512)
      const makeLink = (rel, attrs) => {
        const l = document.createElement('link');
        l.rel = rel;
        Object.entries(attrs).forEach(([k,v]) => l.setAttribute(k, v));
        head.appendChild(l);
        return l;
      };

      makeLink('icon', { type: 'image/png', sizes: '192x192', href: base + `icons/icon-${theme}-192.png?v=${ts}` });
      makeLink('icon', { type: 'image/png', sizes: '512x512', href: base + `icons/icon-${theme}-512.png?v=${ts}` });
      makeLink('apple-touch-icon', { sizes: '180x180', href: base + `icons/icon-${theme}-192.png?v=${ts}` });

      // replace manifest link
      removeAll('link[rel="manifest"]');
      makeLink('manifest', { href: base + `manifest-${theme}.json?v=${ts}` });

      // update theme-color meta
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (themeColorMeta) themeColorMeta.setAttribute('content', theme === 'dark' ? '#0b1116' : '#2b6ff7');
    } catch {}

    // Convert stored category colors to matching theme variants and bump themeVersion
    try {
      const toDark = theme === 'dark';
      categories.forEach(cat => {
        const key = `${cat.storageKey}-color`;
        try {
          const stored = localStorage.getItem(key);
          if (!stored) return;
          const mapped = mapColorForTheme(stored, toDark);
          if (mapped && mapped !== stored) localStorage.setItem(key, mapped);
        } catch {}
      });
      setThemeVersion(v => v + 1);
    } catch {}
  }, [theme, categories]);

  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  function slugifyTitle(title) {
    return "todo-" + title.trim().toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
  }

  function addCategory() {
    const t = newTitle.trim();
    if (!t) return;
    const id = "c" + Date.now() + Math.floor(Math.random() * 1000);
    const storageKey = slugifyTitle(t);
    setCategories((p) => [...p, { id, title: t, storageKey }]);
    setNewTitle("");
    setAdding(false);
  }

  function removeCategory(id) {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    if (!window.confirm(`Delete category "${cat.title}" and its tasks?`)) return;
    try {
      localStorage.removeItem(cat.storageKey);
    } catch {}
    setCategories((p) => p.filter((c) => c.id !== id));
  }

  return (
    <div className="app">
      <div className="app-header">
        <h1>TO DO LIST</h1>

            <div className="theme-switch" aria-hidden>
          <label style={{display:'inline-flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:12,color:'var(--muted)'}}>{theme === 'dark' ? 'Dark' : 'Light'}</span>
            <button
              className={`theme-toggle ${theme === 'dark' ? 'active' : ''}`}
              aria-pressed={theme === 'dark'}
              onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
              title="Toggle theme"
              aria-label="Toggle dark mode"
            >
              {/* Sun icon */}
              <svg className="icon sun" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <circle cx="12" cy="12" r="4" fill="currentColor" />
                <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="12" y1="1.5" x2="12" y2="4.5" />
                  <line x1="12" y1="19.5" x2="12" y2="22.5" />
                  <line x1="1.5" y1="12" x2="4.5" y2="12" />
                  <line x1="19.5" y1="12" x2="22.5" y2="12" />
                  <line x1="4.2" y1="4.2" x2="6.2" y2="6.2" />
                  <line x1="17.8" y1="17.8" x2="19.8" y2="19.8" />
                  <line x1="4.2" y1="19.8" x2="6.2" y2="17.8" />
                  <line x1="17.8" y1="6.2" x2="19.8" y2="4.2" />
                </g>
              </svg>
              {/* Moon icon */}
              <svg className="icon moon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" />
              </svg>
            </button>
          </label>
        </div>
      </div>

      <div className="lists">
        {categories.map((c) => (
          <div key={c.id} className="list">
            <TodoList
              title={c.title}
              storageKey={c.storageKey}
              onDelete={() => removeCategory(c.id)}
              theme={theme}
              themeVersion={themeVersion}
            />
          </div>
        ))}

        {/* Add-category card به صورت یک .list تا اندازه برابر داشته باشد */}
        <div className="list add-category-card">
          {!adding ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <button
                className="plus-btn"
                onClick={() => setAdding(true)}
                aria-label="Add new category"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 12 12"
                >
                  <path
                    fill="currentColor"
                    d="M6 1.75a.75.75 0 0 1 .75.75v2.75H9.5a.75.75 0 0 1 0 1.5H6.75V9.5a.75.75 0 0 1-1.5 0V6.75H2.5a.75.75 0 0 1 0-1.5h2.75V2.5A.75.75 0 0 1 6 1.75"
                  />
                </svg>
                Add category
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <input
                ref={inputRef}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addCategory();
                  if (e.key === "Escape") {
                    setNewTitle("");
                    setAdding(false);
                  }
                }}
                placeholder="Category name (e.g. Study)"
                aria-label="New category name"
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 8,
                  border: "1px solid #ddd",
                }}
              />
              <button type="button" onClick={addCategory} className="add-btn add-btn--accent" style={{ padding: "8px 10px", borderRadius: 8 }}>
                Add
              </button>
              <button type="button" onClick={() => {
                  setNewTitle("");
                  setAdding(false);
                }} className="cancel-btn add-btn add-btn--accent" style={{ padding: "8px 10px", borderRadius: 8 }}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
