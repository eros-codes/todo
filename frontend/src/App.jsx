import { useEffect, useRef, useState } from "react";
import TodoList from "./TodoList";

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
            <TodoList
              title={c.title}
              storageKey={c.storageKey}
              onDelete={() => removeCategory(c.id)}
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
