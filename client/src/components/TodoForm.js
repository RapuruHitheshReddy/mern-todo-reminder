// src/components/TodoForm.js
import React, { useState, useEffect } from 'react';
import { FaPlusCircle, FaEdit } from 'react-icons/fa';

const TodoForm = ({ onSubmit, initialData, isEditing }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setDueDate(
        initialData.dueDate
          ? new Date(initialData.dueDate).toISOString().slice(0, 16)
          : ''
      );
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !dueDate) return alert('Title and Due Date/Time required!');
    onSubmit({ title, description, dueDate });
    setTitle('');
    setDescription('');
    setDueDate('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-dark text-light p-4 rounded shadow-sm mb-5"
      style={{
        animation: 'fadeIn 0.5s ease-in-out',
        border: '1px solid #333',
      }}
    >
      <div className="d-flex align-items-center mb-4">
        {isEditing ? (
          <FaEdit className="me-2 text-warning fs-4" />
        ) : (
          <FaPlusCircle className="me-2 text-success fs-4" />
        )}
        <h4 className="mb-0">{isEditing ? 'Update Todo' : 'Add New Todo'}</h4>
      </div>

      <div className="row gy-3">
        <div className="col-md-4">
          <label className="form-label">Title *</label>
          <input
            type="text"
            className="form-control bg-secondary text-light border-0"
            placeholder="Enter title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Description</label>
          <input
            type="text"
            className="form-control bg-secondary text-light border-0"
            placeholder="Optional description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Due Date & Time *</label>
          <input
            type="datetime-local"
            className="form-control bg-secondary text-light border-0"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          type="submit"
          className={`btn px-4 ${isEditing ? 'btn-warning' : 'btn-success'}`}
        >
          {isEditing ? 'Update Task' : 'Add Task'}
        </button>
      </div>
    </form>
  );
};

export default TodoForm;
