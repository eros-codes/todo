import React, { useState } from "react";

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
            <button onClick={() => setEditing(true)} aria-label="Edit">✏️</button>
            <button onClick={onDelete} aria-label="delete">❌</button>
          </>
        ) : (
          <>
            <button onClick={saveEdit} aria-label="save">💾</button>
            <button
              onClick={() => {
                setDraft(item.text);
                setEditing(false);
              }}
              aria-label="cancel"
            >
              ✖️
            </button>
          </>
        )}
      </div>
    </div>
  );
}
