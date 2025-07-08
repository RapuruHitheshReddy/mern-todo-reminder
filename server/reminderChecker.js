const Todo = require('./models/Todo');

// In-memory map to track last reminded time for each todo
const lastRemindedMap = new Map();

const checkReminders = async (io) => {
  const now = new Date();
  const inTenMinutes = new Date(now.getTime() + 10 * 60 * 1000);

  try {
    const todosToRemind = await Todo.find({
      dueDate: { $lte: inTenMinutes, $gt: now },
      completed: false,
    });

    for (let todo of todosToRemind) {
      const lastRemindedAt = lastRemindedMap.get(todo._id?.toString());

      // Only notify if it's been 60 seconds since last reminder
      if (!lastRemindedAt || now - lastRemindedAt > 60 * 1000) {
        console.log(`⏰ Reminder: '${todo.title}' is due soon at ${todo.dueDate}`);

        io.emit('reminder', {
          id: todo._id,
          title: todo.title,
          dueDate: todo.dueDate,
        });

        lastRemindedMap.set(todo._id?.toString(), now);
      }
    }
  } catch (err) {
    console.error('Error checking reminders:', err);
  }
};

module.exports = checkReminders;
