// src/TodoList.jsx
import { useEffect, useState } from "react";
import TodoItem from "./TodoItem";
import NewItemInput from "./NewItemInput";

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

// darker/desaturated palette for dark mode so swatches and card backgrounds look right
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

function isDocumentDark() {
  try { return document?.documentElement?.getAttribute('data-theme') === 'dark' } catch { return false }
}

function isLightColor(hex) {
  try {
    const c = hex.replace('#','');
    const bigint = parseInt(c.length === 3 ? c.split('').map(ch=>ch+ch).join('') : c, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    // perceived brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 180;
  } catch { return true }
}

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

export default function TodoList({ title, storageKey, onDelete, theme, themeVersion }) {
  const dark = (theme === 'dark') || isDocumentDark();
  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [color, setColor] = useState(() => {
    try {
      return localStorage.getItem(`${storageKey}-color`) || "#ffffff";
    } catch {
      return "#ffffff";
    }
  });

  // Re-read stored color whenever themeVersion changes (force update when App maps colors)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`${storageKey}-color`);
      if (stored) setColor(stored);
    } catch {}
  }, [themeVersion, storageKey]);

  // On mount: if stored color matches a dark-palette value, normalize to the canonical PALETTE value
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`${storageKey}-color`);
      if (!stored) return;
      const norm = normalizeColorString(stored);
      const idxDark = PALETTE_DARK.findIndex(p => p.value.toLowerCase() === norm);
      if (idxDark !== -1) {
        const lightVal = PALETTE[idxDark]?.value;
        if (lightVal) {
          setColor(lightVal);
          localStorage.setItem(`${storageKey}-color`, lightVal);
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resolve a stored (light) color to the theme-appropriate display color.
  function resolveColorForTheme(col) {
    try {
      const dark = (theme === 'dark') || isDocumentDark();
      if (!col) return col;
      const norm = normalizeColorString(col);
      // find index in PALETTE (match by value or name)
      let idx = PALETTE.findIndex(p => p.value.toLowerCase() === norm || p.name.toLowerCase() === norm);
      if (idx === -1) {
        // maybe the stored value is a dark variant; try PALETTE_DARK
        idx = PALETTE_DARK.findIndex(p => p.value.toLowerCase() === norm || p.name.toLowerCase() === norm);
        if (idx !== -1) {
          return dark ? PALETTE_DARK[idx].value : PALETTE[idx].value;
        }
      } else {
        return dark ? PALETTE_DARK[idx].value : PALETTE[idx].value;
      }
      // fallback: if stored value already looks like a dark variant, just return it
      return col;
    } catch { return col }
  }

  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(tasks));
    } catch {}
  }, [tasks, storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(`${storageKey}-color`, color);
    } catch {}
  }, [color, storageKey]);

  const addTask = (text) => {
    const trimmed = text?.trim();
    if (!trimmed) return;
    const task = { id: Date.now() + Math.random(), text: trimmed, done: false };
    setTasks((p) => [...p, task]);
  };

  const removeTask = (id) => {
    if (!window.confirm("Are you sure about deleting this task?")) return;
    setTasks((p) => p.filter((t) => t.id !== id));
  };

  const toggleDone = (id) => {
    setTasks((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const editTask = (id, newText) => {
    const trimmed = newText?.trim();
    if (!trimmed) return;
    setTasks((p) => p.map((t) => (t.id === id ? { ...t, text: trimmed } : t)));
  };

  const chooseColor = (value) => {
    setColor(value);
    setPaletteOpen(false);
  };

  const displayColor = resolveColorForTheme(color);
  const isLightBg = isLightColor((displayColor || '#ffffff').toLowerCase());
  const normDisplay = normalizeColorString(displayColor || '#ffffff');
  const isPureWhite = normDisplay === '#ffffff' || normDisplay === '#fff' || normDisplay === 'white';
  // make the add button white when the card is colored (even if it's a light color like pink)
  const addButtonWhite = !isPureWhite;

  return (
    <section
      className="list"
      aria-labelledby={`list-${storageKey}`}
      style={{
        background: displayColor,
        position: "relative",
        // set a CSS variable for this list's accent so checkboxes can use it
        ["--list-accent"]: displayColor,
      }}
    >
      <h2 id={`list-${storageKey}`} style={{ color: isLightBg ? '#111' : '#fff' }}>
        {title}
      </h2>

      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          display: "flex",
          gap: 12,
          alignItems: "center",
        }}
      >
        <button
          className="color-toggle"
          aria-label="Change list color"
          onClick={() => setPaletteOpen((s) => !s)}
          title="Change list color"
        >
          <span
            style={{
              display: "inline-block",
              width: 18,
              height: 18,
              borderRadius: 99,
              background: displayColor,
              border: dark ? '2px solid rgba(255,255,255,0.06)' : '2px solid #fff',
            }}
          />
        </button>
        
        <button
          className="category-delete"
          title={`Delete ${title}`}
          onClick={onDelete}
          aria-label={`Delete category ${title}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {paletteOpen && (
        <div className="color-palette" role="dialog" aria-label="color palette">
          {(dark ? PALETTE_DARK : PALETTE).map((p) => (
            <button
              key={p.value}
              className="color-swatch"
              title={p.name}
              aria-label={p.name}
              onClick={() => chooseColor(p.value)}
              style={{
                background: p.value,
              }}
            />
          ))}
        </div>
      )}

      <NewItemInput onAdd={addTask} addButtonWhite={addButtonWhite} />

      <div className="items" role="list" aria-label={`${title} tasks`}>
        {tasks.length === 0 ? (
          <div className="empty">no item to show</div>
        ) : (
          tasks.map((task) => (
            <TodoItem
              key={task.id}
              item={task}
              onToggle={() => toggleDone(task.id)}
              onDelete={() => removeTask(task.id)}
              onEdit={(text) => editTask(task.id, text)}
            />
          ))
        )}
      </div>
    </section>
  );
}
