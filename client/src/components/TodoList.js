import React, { useEffect, useState } from 'react';
import {
  FaEdit,
  FaTrash,
  FaClock,
  FaHourglassHalf,
  FaCheck,
} from 'react-icons/fa';

const formatRemainingTime = (ms) => {
  const abs = Math.abs(ms);
  const h = Math.floor(abs / 3600000);
  const m = Math.floor((abs % 3600000) / 60000);
  const s = Math.floor((abs % 60000) / 1000);

  return ms < 0
    ? `Overdue by ${h}h ${m}m ${s}s`
    : `${h}h ${m}m ${s}s`;
};

const TodoList = ({ todos, onEdit, onDelete, onToggleComplete }) => {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const updateRemaining = () => {
      const now = new Date().getTime();
      const updated = {};
      todos.forEach((todo) => {
        updated[todo._id] = new Date(todo.dueDate).getTime() - now;
      });
      setTimeLeft(updated);
    };

    updateRemaining(); // Initial call
    const interval = setInterval(updateRemaining, 1000);
    return () => clearInterval(interval);
  }, [todos]);

  return (
    <div className="mt-4">
      <h4 className="mb-4 text-light">📋 My Tasks</h4>

      {todos.length === 0 ? (
        <div className="alert alert-secondary">No tasks yet. Start adding one!</div>
      ) : (
        <div className="row g-4">
          {todos.map((todo) => {
            const remaining = timeLeft[todo._id] ?? 0;
            const isOverdue = remaining < 0;
            const status = todo.completed
              ? 'Completed'
              : isOverdue
              ? 'Overdue'
              : 'Pending';
            const statusClass = todo.completed
              ? 'success'
              : isOverdue
              ? 'danger'
              : 'warning';

            return (
              <div key={todo._id} className="col-md-6 col-lg-4">
                <div
                  className={`card shadow-lg border-start border-5 border-${statusClass} h-100`}
                  style={{
                    animation: 'fadeIn 0.4s ease',
                    backgroundColor: '#1e1e1e',
                    color: '#fff',
                  }}
                >
                  <div className="card-body d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="card-title fw-bold text-truncate">
                          {todo.title}
                        </h5>
                        <span className={`badge bg-${statusClass}`}>
                          {status}
                        </span>
                      </div>

                      {todo.description && (
                        <p className="text-secondary small mb-2">
                          {todo.description}
                        </p>
                      )}

                      <p className="mb-1">
                        <FaClock className="me-2 text-warning" />
                        <strong>Due:</strong>{' '}
                        {new Date(todo.dueDate).toLocaleString()}
                      </p>

                      <p className="mb-2">
                        <FaHourglassHalf className="me-2 text-info" />
                        <strong>Time left:</strong>{' '}
                        <span
                          className={
                            isOverdue
                              ? 'text-danger fw-semibold'
                              : 'text-info fw-semibold'
                          }
                        >
                          {formatRemainingTime(remaining)}
                        </span>
                      </p>
                    </div>

                    <div className="d-flex flex-wrap justify-content-between mt-3 gap-2">
                      {!todo.completed && (
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => onToggleComplete(todo._id)}
                        >
                          <FaCheck className="me-1" />
                          Mark as Done
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() => onEdit(todo)}
                      >
                        <FaEdit className="me-1" />
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onDelete(todo._id)}
                      >
                        <FaTrash className="me-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TodoList;
