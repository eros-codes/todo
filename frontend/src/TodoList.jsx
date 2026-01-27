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

export default function TodoList({ title, storageKey, onDelete }) {
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

  const isWhite =
    color.toLowerCase() === "#ffffff" || color.toLowerCase() === "white";

  const addButtonWhite = !isWhite;

  return (
    <section
      className="list"
      aria-labelledby={`list-${storageKey}`}
      style={{
        background: color,
        position: "relative",
        // set a CSS variable for this list's accent so checkboxes can use it
        ["--list-accent"]: isWhite ? "var(--accent)" : color,
      }}
    >
      <h2 
        id={`list-${storageKey}`}
        style={{
          color: color.toLowerCase() === "#ffffff" || color.toLowerCase() === "#f7f7f7" ? "#111" : "#fff"
        }}
      >
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
              background: color,
              border: "2px solid #fff",
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
          {PALETTE.map((p) => (
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
