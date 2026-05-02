const express = require('express');
const crypto = require('crypto');
const pool = require('../db/connection');
const { authMiddleware, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

// Get all projects for the logged in user
router.get('/', async (req, res) => {
  try {
    const { userId, role } = req.user;
    
    let projects = [];
    if (role === 'ADMIN') {
      const [rows] = await pool.query('SELECT * FROM projects WHERE owner_id = ?', [userId]);
      projects = rows;
    } else {
      const [rows] = await pool.query(`
        SELECT p.* FROM projects p
        JOIN project_members pm ON p.id = pm.project_id
        WHERE pm.user_id = ?
      `, [userId]);
      projects = rows;
    }
    
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new project (Admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const id = crypto.randomUUID();
    
    await pool.query(
      'INSERT INTO projects (id, name, description, owner_id) VALUES (?, ?, ?, ?)',
      [id, name, description, req.user.userId]
    );
    
    const [rows] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get project details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [projects] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
    
    if (projects.length === 0) return res.status(404).json({ message: 'Project not found' });
    const project = projects[0];
    
    // Get members
    const [members] = await pool.query(`
      SELECT u.id, u.name, u.email FROM users u
      JOIN project_members pm ON u.id = pm.user_id
      WHERE pm.project_id = ?
    `, [id]);
    
    // Get tasks
    const [tasks] = await pool.query(`
      SELECT t.*, u.name as assignee_name FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.project_id = ?
    `, [id]);
    
    project.members = members;
    project.tasks = tasks;
    
    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add member to project (Admin only)
router.post('/:id/members', requireAdmin, async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { email } = req.body;
    
    const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    const userId = users[0].id;
    
    // Check if user is already a member
    const [existing] = await pool.query(
      'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
      [projectId, userId]
    );
    if (existing.length > 0) return res.status(400).json({ message: 'User is already a member' });
    
    const id = crypto.randomUUID();
    await pool.query(
      'INSERT INTO project_members (id, project_id, user_id) VALUES (?, ?, ?)',
      [id, projectId, userId]
    );
    
    res.status(201).json({ id, project_id: projectId, user_id: userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
