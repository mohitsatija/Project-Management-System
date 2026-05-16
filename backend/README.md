# Project Manager - Backend

RESTful API backend for the Project Manager system built with Node.js, Express, and MongoDB. Provides role-based access control and comprehensive project management features.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- npm package manager

### Installation

1. Navigate to backend directory
```bash
cd backend
```

2. Install dependencies
```bash
npm install
```

3. Create environment file `.env`:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
Manager_INVITE_TOKEN=your_manager_invite_token
SUPERVISOR_INVITE_TOKEN=your_supervisor_invite_token
PORT=5000
```

4. Start the server
```bash
npm start
```

5. Generate test data
```bash
node testScript.js seed
```

## 🔐 Test Credentials

**Password for all users:** `password123`

- **Supervisor:** supervisor1@gmail.com, supervisor2@gmail.com
- **Managers:** manager1@gmail.com to manager5@gmail.com
- **Members:** member1@gmail.com to member15@gmail.com

## 🛠️ Tech Stack

- **Node.js** with **Express.js** - Server framework
- **MongoDB** with **Mongoose** - Database and ODM
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Multer** - File upload handling
- **ExcelJS** - Report generation
- **CORS** - Cross-origin requests
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/projectmanager
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

5. Start the server
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

## Project Structure

```
├── config/             # Configuration files
│   └── db.js          # Database connection
├── controllers/        # Request handlers
├── middlewares/        # Custom middleware
├── models/            # Database models
├── routes/            # API route definitions
├── uploads/           # File upload directory
└── server.js          # Application entry point
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login
- GET `/api/auth/profile` - Get user profile
- PUT `/api/auth/profile` - Update user profile

### Projects
- GET `/api/projects` - Get all projects
- POST `/api/projects` - Create new project
- GET `/api/projects/:id` - Get project by ID
- PUT `/api/projects/:id` - Update project
- DELETE `/api/projects/:id` - Delete project

### Tasks
- GET `/api/tasks` - Get all tasks
- POST `/api/tasks` - Create new task
- GET `/api/tasks/:id` - Get task by ID
- PUT `/api/tasks/:id` - Update task
- DELETE `/api/tasks/:id` - Delete task

### Reports
- GET `/api/reports/export/projects` - Export projects to Excel
- GET `/api/reports/export/tasks` - Export tasks to Excel
- GET `/api/reports/export/users` - Export users to Excel

## Database Models

### User Model
```javascript
{
  name: String,
  email: String,
  password: String,
  role: String,
  profileImageUrl: String,
  createdAt: Date
}
```

### Project Model
```javascript
{
  title: String,
  description: String,
  status: String,
  priority: String,
  dueDate: Date,
  assignedTo: [ObjectId],
  createdBy: ObjectId,
  totalBudget: Number,
  currentBudget: Number
}
```

### Task Model
```javascript
{
  title: String,
  description: String,
  status: String,
  priority: String,
  dueDate: Date,
  assignedTo: [ObjectId],
  projectId: ObjectId,
  taskBudget: Number
}
```

## Authentication & Authorization

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### User Roles

1. **Supervisor** - Full access to all resources
2. **Manager** - Can manage projects and tasks
3. **Member** - Can view and update assigned tasks

## File Uploads

File uploads are handled using Multer middleware. Uploaded files are stored in the `uploads/` directory.

Maximum file size: 10MB
Supported formats: Images, documents, etc.

## Error Handling

The API returns consistent error responses:

```javascript
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info"
}
```

## Environment Variables

Required environment variables:

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
