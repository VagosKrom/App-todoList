import React, { useState, useEffect, useCallback } from "react";
import { Task } from "./types/Task";
import "./styles.css";

const LOCAL_STORAGE_KEY = "tasks";

const App = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = useCallback(() => {
    if (!newTask.trim()) return;
    setTasks((prevTasks) => [
      ...prevTasks,
      { id: crypto.randomUUID(), title: newTask, completed: false },
    ]);
    setNewTask("");
  }, [newTask]);

  const toggleTask = useCallback((id: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  }, []);

  const startEdit = useCallback((task: Task) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingTitle("");
  }, []);

  const saveEdit = useCallback(() => {
    if (!editingTitle.trim()) return;
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === editingId ? { ...task, title: editingTitle } : task
      )
    );
    cancelEdit();
  }, [editingId, editingTitle, cancelEdit]);

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed;
    if (filter === "pending") return !task.completed;
    return true;
  });

  return (
    <div
      className="App"
      style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}
    >
      <h1>To-Do List</h1>
      <input
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="New task"
      />
      <button onClick={addTask}>Add</button>

      <div style={{ marginTop: "1rem" }}>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("completed")}>Completed</button>
        <button onClick={() => setFilter("pending")}>Pending</button>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {filteredTasks.map((task) => (
          <li
            key={task.id}
            style={{
              marginTop: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
            />
            {editingId === task.id ? (
              <>
                <input
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                  autoFocus
                />
                <button onClick={saveEdit}>Save</button>
                <button onClick={cancelEdit}>Cancel</button>
              </>
            ) : (
              <>
                <span
                  onDoubleClick={() => startEdit(task)}
                  style={{
                    textDecoration: task.completed ? "line-through" : "none",
                    cursor: "pointer",
                    flex: 1,
                  }}
                >
                  {task.title}
                </span>
                <button onClick={() => startEdit(task)}>Edit</button>
                <button onClick={() => deleteTask(task.id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
