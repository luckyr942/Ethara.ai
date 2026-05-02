const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('./connection');

async function seed() {
  try {
    console.log('Starting seed process...');
    
    // Clear existing data (in correct order to respect foreign keys)
    await pool.query('DELETE FROM tasks');
    await pool.query('DELETE FROM project_members');
    await pool.query('DELETE FROM projects');
    await pool.query('DELETE FROM users');

    // Create Users
    const adminId = crypto.randomUUID();
    const member1Id = crypto.randomUUID();
    const member2Id = crypto.randomUUID();
    
    const adminPass = await bcrypt.hash('password123', 10);
    const memberPass = await bcrypt.hash('password123', 10);

    await pool.query(
      'INSERT INTO users (id, name, email, password, role) VALUES ?',
      [[
        [adminId, 'Sarah Jenkins (Admin)', 'admin@ethara.ai', adminPass, 'ADMIN'],
        [member1Id, 'Alex Chen', 'alex@ethara.ai', memberPass, 'MEMBER'],
        [member2Id, 'Maria Garcia', 'maria@ethara.ai', memberPass, 'MEMBER']
      ]]
    );

    // Create Projects
    const project1Id = crypto.randomUUID();
    const project2Id = crypto.randomUUID();
    const project3Id = crypto.randomUUID();

    await pool.query(
      'INSERT INTO projects (id, name, description, owner_id) VALUES ?',
      [[
        [project1Id, 'Website Redesign', 'Overhaul the main marketing website with new branding.', adminId],
        [project2Id, 'Mobile App Launch', 'Q3 goal to launch the React Native iOS application.', adminId],
        [project3Id, 'Backend Migration', 'Migrate legacy APIs to new Node.js microservices.', adminId]
      ]]
    );

    // Add Members to Projects
    const m1 = crypto.randomUUID();
    const m2 = crypto.randomUUID();
    const m3 = crypto.randomUUID();
    const m4 = crypto.randomUUID();

    await pool.query(
      'INSERT INTO project_members (id, project_id, user_id) VALUES ?',
      [[
        [m1, project1Id, member1Id],
        [m2, project1Id, member2Id],
        [m3, project2Id, member1Id],
        [m4, project3Id, member2Id]
      ]]
    );

    // Create Tasks
    const now = new Date();
    const pastDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '); // 7 days ago
    const futureDate1 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '); // 3 days from now
    const futureDate2 = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '); // 10 days from now
    const futureDate3 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');

    const tasks = [
      // Website Redesign Tasks
      [crypto.randomUUID(), 'Design homepage mockups', 'Figma mockups for the new homepage', 'DONE', pastDate, project1Id, member1Id],
      [crypto.randomUUID(), 'Implement responsive navbar', 'Ensure navbar works on mobile devices', 'IN_PROGRESS', futureDate1, project1Id, member2Id],
      [crypto.randomUUID(), 'Optimize images', 'Compress all assets using WebP', 'TODO', pastDate, project1Id, member1Id], // Overdue task
      [crypto.randomUUID(), 'Setup CI/CD pipeline', 'GitHub actions for automated deployment', 'TODO', futureDate2, project1Id, null], // Unassigned

      // Mobile App Tasks
      [crypto.randomUUID(), 'Configure React Navigation', 'Setup stack and tab navigators', 'DONE', pastDate, project2Id, member1Id],
      [crypto.randomUUID(), 'Integrate Push Notifications', 'Use Firebase Cloud Messaging', 'IN_PROGRESS', futureDate1, project2Id, member1Id],
      [crypto.randomUUID(), 'App Store Submission', 'Prepare metadata and screenshots', 'TODO', futureDate3, project2Id, member1Id],

      // Backend Migration Tasks
      [crypto.randomUUID(), 'Setup Docker containers', 'Containerize the Express app', 'DONE', pastDate, project3Id, member2Id],
      [crypto.randomUUID(), 'Migrate user data', 'Move user table from PostgreSQL to MySQL', 'IN_PROGRESS', futureDate2, project3Id, member2Id],
      [crypto.randomUUID(), 'Write API tests', 'Jest tests for all endpoints', 'TODO', futureDate1, project3Id, null],
    ];

    await pool.query(
      'INSERT INTO tasks (id, title, description, status, due_date, project_id, assignee_id) VALUES ?',
      [tasks]
    );

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seed();
