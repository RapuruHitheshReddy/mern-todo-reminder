// src/App.js
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import TodoForm from "./components/TodoForm";
import TodoList from "./components/TodoList";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { io } from "socket.io-client";
import api from "./services/api";

function App() {
  const [todos, setTodos] = useState([]);
  const [editingTodo, setEditingTodo] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(""); // ✅ Added
  const [loading, setLoading] = useState(true);

  const fetchTodos = async () => {
    try {
      const res = await api.get("/todos");
      setTodos(res.data);
    } catch (err) {
      console.error("Error fetching todos:", err);
    }
  };

  const addTodo = async (todoData) => {
    try {
      if (editingTodo) {
        await api.put(`/todos/${editingTodo._id}`, todoData);
        toast.info("✅ Todo updated successfully");
      } else {
        await api.post("/todos", todoData);
        toast.success("🆕 Todo added successfully");
      }
      setEditingTodo(null);
      fetchTodos();
    } catch (err) {
      console.error("Error saving todo:", err);
      toast.error("⚠️ Failed to save todo");
    }
  };

  const deleteTodo = async (id) => {
    try {
      await api.delete(`/todos/${id}`);
      fetchTodos();
      toast.success("🗑️ Todo deleted");
    } catch (err) {
      console.error("Error deleting todo:", err);
      toast.error("⚠️ Failed to delete todo");
    }
  };

  const toggleComplete = async (id) => {
    const todo = todos.find((t) => t._id === id);
    if (!todo) return;
    try {
      await api.put(`/todos/${id}`, {
        ...todo,
        completed: !todo.completed,
      });
      fetchTodos();
      toast.info(`✔️ Marked as ${!todo.completed ? "complete" : "incomplete"}`);
    } catch (err) {
      console.error("Error toggling complete:", err);
      toast.error("⚠️ Failed to update status");
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      setIsLoggedIn(false);
      setUsername(""); // ✅ Clear username
      toast.info("Logged out");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  const handleLoginSuccess = async () => {
    try {
      const res = await api.get("/auth/me");
      setIsLoggedIn(true);
      setUsername(res.data.user.name); // ✅ Set username
      fetchTodos();
    } catch (err) {
      console.error("Login verification failed");
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/me");
        setIsLoggedIn(true);
        setUsername(res.data.user.name); // ✅ Set username on load
        fetchTodos();
      } catch (err) {
        setIsLoggedIn(false);
        setUsername(""); // ✅ Reset username if not authenticated
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      const socket = io(process.env.REACT_APP_API_BASE, {
        withCredentials: true,
      });

      socket.on("reminder", (data) => {
        toast.warn(
          `⏰ Reminder: "${data.title}" is due at ${new Date(
            data.dueDate
          ).toLocaleTimeString()}`,
          {
            position: "top-right",
            autoClose: 8000,
            theme: "dark",
          }
        );
      });

      return () => socket.disconnect();
    }
  }, [isLoggedIn]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 text-white bg-black">
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <Router>
      <Navbar
        isAuthenticated={isLoggedIn}
        username={username}
        onLogout={handleLogout}
      />

      <div className="w-100 bg-black text-white min-vh-100 px-3 py-4">
        <Routes>
          <Route
            path="/login"
            element={<Login onLogin={handleLoginSuccess} />}
          />
          <Route
            path="/register"
            element={<Register onLogin={handleLoginSuccess} />}
          />
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <>
                  <h1 className="mb-4">📝 My Todo List</h1>
                  <TodoForm
                    onSubmit={addTodo}
                    initialData={editingTodo}
                    isEditing={!!editingTodo}
                  />
                  <TodoList
                    todos={todos}
                    onEdit={setEditingTodo}
                    onDelete={deleteTodo}
                    onToggleComplete={toggleComplete}
                  />
                </>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </div>

      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </Router>
  );
}

export default App;
