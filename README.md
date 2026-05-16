# Project Manager System

A comprehensive project management system built with React.js frontend and Node.js backend. This system allows supervisors, managers, and team members to collaborate efficiently on projects and tasks.

## 🌟 Features

- **Role-based Authentication**: Supervisor, Manager, and Member roles with different permissions
- **Project Management**: Create, assign, and track projects with budgets and deadlines
- **Task Management**: Break down projects into manageable tasks with todo checklists
- **Budget Tracking**: Monitor project and task budgets with detailed history
- **Real-time Dashboard**: Interactive charts and statistics for each role
- **User Management**: Profile management with image uploads
- **Responsive Design**: Modern UI that works on all devices

## 🏗️ Architecture

```
ProjectManager/
├── frontend/          # React.js application (Vite + Tailwind CSS)
├── backend/           # Node.js API server (Express + MongoDB)
├── README.md          # This file
└── .gitignore         # Git ignore rules
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB installation
- Git

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ProjectManager
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
Manager_INVITE_TOKEN=your_manager_invite_token
SUPERVISOR_INVITE_TOKEN=your_supervisor_invite_token
PORT=5000
```

Start the backend server:

```bash
npm start
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

## 🔐 Test Credentials
Use users.txt

**Password for all users:** `password123`

### Sample Accounts:
- **Supervisor:** supervisor1@gmail.com
- **Manager:** manager1@gmail.com
- **Member:** member1@gmail.com

## 📱 User Roles

### Supervisor
- Create and manage projects
- Assign managers to projects
- Monitor overall progress and budgets
- View comprehensive analytics

### Manager
- Manage assigned projects
- Create and assign tasks to team members
- Track project progress and budgets
- Generate reports

### Member
- View assigned tasks
- Update task progress and todo items
- Track personal workload
- Submit time and progress reports

## 🛠️ Technology Stack

### Frontend
- **React.js** - UI framework,With ShadCN components
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **React Router** - Navigation
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads

## 📂 Project Structure

### Backend Structure
```
backend/
├── controllers/       # Route controllers
├── models/           # Database models
├── routes/           # API routes
├── middlewares/      # Custom middlewares
├── uploads/          # File uploads
├── config/           # Database configuration
├── server.js         # Main server file

```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/   # Reusable components
│   ├── pages/        # Page components
│   ├── context/      # React context
│   ├── hooks/        # Custom hooks
│   ├── lib/          # Utilities
│   ├── routes/       # Route components
│   └── utils/        # API utilities
├── public/           # Static assets
└── index.html        # Entry point
```

## 🔧 Development Commands

### Backend
```bash
# Start development server
npm start

### Frontend
```bash

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Users
- `GET /api/users` - Get all users
- `PUT /api/users/profile` - Update profile
- `POST /api/users/upload` - Upload profile image

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check your MongoDB connection string
   - Ensure your IP is whitelisted in MongoDB Atlas

2. **Port Already in Use**
   - Change the PORT in `.env` file
   - Kill existing processes using the port

3. **Module Not Found**
   - Run `npm install` in both frontend and backend directories
   - Clear node_modules and reinstall if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🆘 Support

For support, email your-email@example.com or create an issue in the repository.

## 🔮 Future Enhancements

- Real-time notifications
- File attachments for tasks
- Time tracking functionality
- Advanced reporting and analytics
- Mobile application
- Integration with third-party tools

---

