# Ethara.ai - Team Task Manager

A full-stack, responsive web application for project and task management, featuring role-based access control.

## Technologies Used
- **Backend**: Node.js, Express
- **Database**: MySQL (Raw queries via `mysql2`)
- **Frontend**: React, Vite, React Router
- **Styling**: Pure Vanilla CSS with Custom Variables (Minimalist Light Theme, Glassmorphism)
- **Authentication**: JWT & bcrypt

## Features
- **User Roles**: Admin (can create projects/tasks) and Member (can update task status).
- **Dashboard**: Track overall statistics including overdue tasks.
- **Projects**: Kanban board for task tracking across To Do, In Progress, and Done.
- **Dynamic UI**: Staggered entry animations, hover interactions, and sleek UI.

## Running Locally

1. **Database Setup**
   Ensure you have a local MySQL server running (e.g., via XAMPP).
   The backend connects to `localhost` on port 3306 as `root` with no password by default.

2. **Install Dependencies**
   From the root folder, install backend and frontend dependencies:
   ```bash
   npm install
   cd client && npm install
   ```

3. **Start Development Servers**
   To start the backend (runs on port 8080):
   ```bash
   npm run dev
   ```
   To start the frontend (runs on port 5173):
   ```bash
   cd client && npm run dev
   ```

## Railway Deployment
This project is structured as a single service for easy deployment on Railway.

1. Create a MySQL Database service on Railway.
2. Link your GitHub repository to a new Railway Web Service.
3. The application will automatically detect Railway's MySQL environment variables (`MYSQLHOST`, `MYSQLUSER`, etc.)!
4. You ONLY need to add one Environment Variable to the Web Service:
   - `JWT_SECRET`: `your_random_secret_string`
5. Railway will automatically build the React frontend and serve it via the Express backend.
