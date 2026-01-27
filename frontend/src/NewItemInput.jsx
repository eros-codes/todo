// src/NewItemInput.jsx
import { useEffect, useRef, useState } from "react";

/**
 * props:
 *  - onAdd(text)
 *  - addButtonWhite (boolean) -> اگر true باشه دکمه Add و دکمه + سفید میشن
 */
export default function NewItemInput({ onAdd, addButtonWhite = false }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (open) ref.current?.focus();
  }, [open]);

  function submit() {
    const t = text.trim();
    if (!t) return;
    onAdd(t);
    setText("");
    setOpen(false);
  }

  // کلاس‌های دکمه Add و دکمه plus بر اساس پراب تنظیم می‌شوند
  const addBtnClass = addButtonWhite ? "add-btn add-btn--white" : "add-btn add-btn--accent";
  const plusClass = addButtonWhite ? "plus-btn plus-btn--white" : "plus-btn";

  return (
    <div className="new-input">
      {!open ? (
        <button
          className={plusClass}
          onClick={() => setOpen(true)}
          aria-label="add new task"
          title="Add task"
        >
          +
        </button>
      ) : (
        <div className="input-row">
          <input
            ref={ref}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
              if (e.key === "Escape") {
                setText("");
                setOpen(false);
              }
            }}
            placeholder="Your new task"
            aria-label="New task"
          />
          <button type="button" onClick={submit} aria-label="add" className={addBtnClass}>
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setText("");
              setOpen(false);
            }}
            aria-label="cancel"
            className={`cancel-btn ${addBtnClass}`}
            title="Cancel"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
