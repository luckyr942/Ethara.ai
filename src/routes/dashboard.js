const express = require('express');
const pool = require('../db/connection');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { userId, role } = req.user;
    
    let tasks = [];
    if (role === 'ADMIN') {
      // Admin sees stats for tasks in their projects
      const [rows] = await pool.query(`
        SELECT t.* FROM tasks t
        JOIN projects p ON t.project_id = p.id
        WHERE p.owner_id = ?
      `, [userId]);
      tasks = rows;
    } else {
      // Member sees stats for their assigned tasks
      const [rows] = await pool.query(`
        SELECT * FROM tasks WHERE assignee_id = ?
      `, [userId]);
      tasks = rows;
    }
    
    const now = new Date();
    const stats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'TODO').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      done: tasks.filter(t => t.status === 'DONE').length,
      overdue: tasks.filter(t => t.status !== 'DONE' && t.due_date && new Date(t.due_date) < now).length
    };
    
    // Recent overdue or upcoming tasks
    const criticalTasks = tasks
      .filter(t => t.status !== 'DONE' && t.due_date)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 5);
      
    res.json({ stats, criticalTasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
