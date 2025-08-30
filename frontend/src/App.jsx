import React, { useEffect, useRef, useState } from "react";
import TodoList from "./TodoList";
import "./index.css";

export default function App() {
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
      <h1>TO DO LIST</h1>

      <div className="lists">
        {categories.map((c) => (
          <div key={c.id} className="list">
            {/* delete button داخل بلوک و در گوشه بالا-راست */}
            <button
              className="category-delete"
              title={`Delete ${c.title}`}
              onClick={() => removeCategory(c.id)}
              aria-label={`Delete category ${c.title}`}
            >
              ❌
            </button>

            <TodoList title={c.title} storageKey={c.storageKey} />
          </div>
        ))}

        {/* Add-category card به صورت یک .list تا اندازه برابر داشته باشد */}
        <div className="list add-category-card">
          {!adding ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <button
                className="plus-btn"
                onClick={() => setAdding(true)}
                aria-label="Add new category"
              >
                ＋ Add category
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
              <button onClick={addCategory} style={{ padding: "8px 10px", borderRadius: 8 }}>
                Add
              </button>
              <button
                onClick={() => {
                  setNewTitle("");
                  setAdding(false);
                }}
                style={{ padding: "8px 10px", borderRadius: 8 }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
