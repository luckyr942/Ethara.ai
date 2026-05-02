const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const dbInit = require('./db/init');

// Initialize database
dbInit();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve static frontend files for Railway deployment
if (process.env.NODE_ENV === 'production' || true) { // Always serve client in this demo if built
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.use((req, res) => {
    // Exclude /api routes from being caught by the react router catch-all
    if (req.originalUrl.startsWith('/api')) {
      return res.status(404).json({ message: 'API Route not found' });
    }
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'), (err) => {
      if (err) {
        res.status(500).send('Frontend not built yet. Run `npm run build` in client directory.');
      }
    });
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
