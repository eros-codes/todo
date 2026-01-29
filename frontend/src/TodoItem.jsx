// frontend/src/TodoItem.jsx
import { useState } from "react";

export default function TodoItem({ item, onToggle, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.text);

  function saveEdit() {
    const trimmed = draft?.trim();
    if (!trimmed) return;
    onEdit(trimmed);
    setEditing(false);
  }

  return (
    <div className="todo-item" role="listitem" aria-label={item.text}>
      <label style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
        <input
          aria-label={`complete ${item.text}`}
          type="checkbox"
          checked={item.done}
          onChange={onToggle}
        />
        {!editing ? (
          <span style={{ textDecoration: item.done ? "line-through" : "none" }}>
            {item.text}
          </span>
        ) : (
          <input
            className="edit-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit();
              if (e.key === "Escape") {
                setDraft(item.text);
                setEditing(false);
              }
            }}
            aria-label="Edit task"
          />
        )}
      </label>

      <div className="item-controls">
        {!editing ? (
          <>
            <button onClick={() => setEditing(true)} aria-label="Edit" title="Edit">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
              </svg>
            </button>
            <button onClick={onDelete} aria-label="Delete" title="Delete">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </>
        ) : (
          <>
            <button onClick={saveEdit} aria-label="save" title="Save" className="save-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => {
                setDraft(item.text);
                setEditing(false);
              }}
              aria-label="cancel"
              title="Cancel"
              className="cancel-edit-btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
