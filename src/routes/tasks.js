const express = require('express');
const crypto = require('crypto');
const pool = require('../db/connection');
const { authMiddleware, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

// Create a task in a project (Admin only)
router.post('/project/:projectId', requireAdmin, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, dueDate, assigneeId } = req.body;
    
    // Check if project exists
    const [projects] = await pool.query('SELECT id FROM projects WHERE id = ?', [projectId]);
    if (projects.length === 0) return res.status(404).json({ message: 'Project not found' });
    
    const id = crypto.randomUUID();
    const formattedDate = dueDate ? new Date(dueDate).toISOString().slice(0, 19).replace('T', ' ') : null;
    
    await pool.query(
      'INSERT INTO tasks (id, title, description, due_date, project_id, assignee_id) VALUES (?, ?, ?, ?, ?, ?)',
      [id, title, description, formattedDate, projectId, assigneeId || null]
    );
    
    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a task (Admin can update anything, Member can only update status of assigned task)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, title, description, dueDate, assigneeId } = req.body;
    const { userId, role } = req.user;
    
    const [tasks] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (tasks.length === 0) return res.status(404).json({ message: 'Task not found' });
    const task = tasks[0];
    
    if (role === 'ADMIN') {
      const formattedDate = dueDate ? new Date(dueDate).toISOString().slice(0, 19).replace('T', ' ') : task.due_date;
      await pool.query(
        'UPDATE tasks SET status = COALESCE(?, status), title = COALESCE(?, title), description = COALESCE(?, description), due_date = COALESCE(?, due_date), assignee_id = COALESCE(?, assignee_id) WHERE id = ?',
        [status, title, description, formattedDate, assigneeId, id]
      );
    } else {
      // Member can only update status if they are the assignee
      if (task.assignee_id !== userId) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }
      if (status) {
        await pool.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
      }
    }
    
    const [updatedRows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(updatedRows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
