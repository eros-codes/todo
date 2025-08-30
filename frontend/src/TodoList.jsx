import React, { useEffect, useState } from "react";
import TodoItem from "./TodoItem";
import NewItemInput from "./NewItemInput";

export default function TodoList({ title, storageKey }) {
  const [tasks, setTasks] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(tasks));
    } catch {}
  }, [tasks, storageKey]);

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

  return (
    <section className="list" aria-labelledby={`list-${storageKey}`}>
      <h2 id={`list-${storageKey}`}>{title}</h2>

      <NewItemInput onAdd={addTask} />

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
