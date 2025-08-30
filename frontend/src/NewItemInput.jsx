import React, { useEffect, useRef, useState } from "react";

export default function NewItemInput({ onAdd }) {
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

  return (
    <div className="new-input">
      {!open ? (
        <button className="plus-btn" onClick={() => setOpen(true)} aria-label="add new task">
          ＋
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
          <button onClick={submit} aria-label="add">Add</button>
          <button onClick={() => { setText(""); setOpen(false); }} aria-label="cancel">Cancel</button>
        </div>
      )}
    </div>
  );
}
