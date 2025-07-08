const Todo = require('../models/Todo');

// Get all todos for logged-in user
exports.getTodos = async (req, res) => {
  try {
    console.log("🔐 Getting todos for:", req.user.id); // Add this line
    const todos = await Todo.find({ user: req.user.id }).sort({ dueDate: 1 });
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


// Create a new todo
exports.createTodo = async (req, res) => {
  const { title, dueDate } = req.body;

  if (!title || !dueDate) {
    return res.status(400).json({ message: 'Title and due date are required' });
  }

  try {
    const todo = new Todo({
      title,
      dueDate,
      user: req.user.id, // ✅ associate todo with current user
    });

    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    console.error('Create todo error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update todo
exports.updateTodo = async (req, res) => {
  try {
    const todo = await Todo.findOne({ _id: req.params.id, user: req.user.id });
    if (!todo) return res.status(404).json({ message: 'Todo not found' });

    Object.assign(todo, req.body);
    await todo.save();

    res.json(todo);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete todo
exports.deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!todo) return res.status(404).json({ message: 'Todo not found' });

    res.json({ message: 'Todo deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
