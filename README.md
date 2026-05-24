# 🚀 Project Manager System

A comprehensive full-stack project management system built with **React.js**, **Node.js**, **Express.js**, and **MongoDB**. This platform enables supervisors, managers, and team members to collaborate efficiently through project tracking, task management, and budget monitoring.

---

## 🌐 Live Demo

🔗 [View ProjectHub Live](https://projecthub-devnexus.vercel.app/)

---

## 🌟 Features

- 🔐 **Role-based Authentication** — Supervisor, Manager, and Member access control
- 📁 **Project Management** — Create, assign, and monitor projects
- ✅ **Task Management** — Assign tasks with todo checklists and progress tracking
- 💰 **Budget Tracking** — Manage project and task budgets with history logs
- 📊 **Interactive Dashboards** — Analytics and charts for each role
- 👤 **Profile Management** — User profile updates with image uploads
- 📱 **Responsive Design** — Optimized for desktop, tablet, and mobile
- ⚡ **Modern UI/UX** — Clean and intuitive interface using Tailwind CSS and ShadCN

---

## 🏗️ Architecture

```bash
ProjectManager/
├── frontend/          # React.js application (Vite + Tailwind CSS)
├── backend/           # Node.js API server (Express + MongoDB)
├── README.md
└── .gitignore
```

---

## 🛠️ Tech Stack

### Frontend
- **React.js** — UI framework
- **Vite** — Fast build tool
- **Tailwind CSS** — Styling framework
- **ShadCN UI** — Reusable UI components
- **Recharts** — Data visualization
- **React Router** — Routing and navigation
- **Axios** — API communication

### Backend
- **Node.js** — Runtime environment
- **Express.js** — Backend framework
- **MongoDB** — NoSQL database
- **Mongoose** — MongoDB ODM
- **JWT Authentication** — Secure authentication
- **Bcrypt.js** — Password hashing
- **Multer** — File uploads

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- Git

---

## 📦 Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone <repository-url>
cd ProjectManager
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

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

---

### 3️⃣ Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

---

## 🔐 Test Credentials

Use `users.txt`

### Password for all users:

```txt
password123
```

### Sample Accounts

- 👨‍💼 **Supervisor:** supervisor1@gmail.com
- 🧑‍💻 **Manager:** manager1@gmail.com
- 👨‍🔧 **Member:** member1@gmail.com

---

## 📱 User Roles

### 👨‍💼 Supervisor
- Create and manage projects
- Assign managers to projects
- Monitor budgets and analytics
- Track overall project progress

### 🧑‍💻 Manager
- Manage assigned projects
- Create and assign tasks
- Monitor deadlines and progress
- Generate reports

### 👨‍🔧 Member
- View assigned tasks
- Update task progress
- Manage todo checklists
- Submit work updates

---

## 📂 Project Structure

### Backend Structure

```bash
backend/
├── controllers/
├── models/
├── routes/
├── middlewares/
├── uploads/
├── config/
└── server.js
```

### Frontend Structure

```bash
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   ├── routes/
│   └── utils/
├── public/
└── index.html
```

---

## 🔧 Development Commands

### Backend

```bash
npm start
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
```

---

## 📊 API Endpoints

### Authentication

```http
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
```

### Projects

```http
GET    /api/projects
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id
```

### Tasks

```http
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

### Users

```http
GET  /api/users
PUT  /api/users/profile
POST /api/users/upload
```

---

## 🐛 Troubleshooting

### Common Issues

### 1️⃣ Database Connection Error
- Verify MongoDB connection string
- Ensure your IP is whitelisted in MongoDB Atlas

### 2️⃣ Port Already in Use
- Change the PORT value in `.env`
- Stop processes using the same port

### 3️⃣ Module Not Found
- Run `npm install` in both frontend and backend
- Delete `node_modules` and reinstall dependencies

---

## 🔮 Future Enhancements

- 🔔 Real-time notifications
- 📎 File attachments for tasks
- ⏱️ Time tracking system
- 📈 Advanced analytics and reporting
- 📱 Mobile application
- 🔗 Third-party integrations

---

## 🤝 Contributing

Contributions are welcome!

### Steps to Contribute

1. Fork the repository

2. Create your feature branch

```bash
git checkout -b feature/amazing-feature
```

3. Commit your changes

```bash
git commit -m "Add amazing feature"
```

4. Push to GitHub

```bash
git push origin feature/amazing-feature
```

5. Open a Pull Request 🚀

---

## 👨‍💻 Author

### Mohit Satija

- GitHub: https://github.com/mohitsatija

---

## 🆘 Support

If you encounter any issues or have suggestions, feel free to open an issue in the repository.

---

## ⭐ Show Your Support

If you liked this project, give it a ⭐ on GitHub!

---
