# Project Manager - Frontend

A modern React-based frontend application for project management with role-based access control and interactive dashboards.

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm package manager

### Installation

1. Navigate to frontend directory
```bash
cd frontend
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🔐 Login Credentials

Use these test accounts (after running backend test script):

**Password for all users:** `password123`

- **Supervisor:** supervisor1@gmail.com
- **Manager:** manager1@gmail.com
- **Member:** member1@gmail.com

## 🛠️ Tech Stack

- **React 18** with **Vite** - Frontend framework and build tool
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern component library
- **Recharts** - Data visualization charts
- **Axios** - HTTP client for API calls
- **React Hook Form** - Form handling
- **Sonner** - Toast notifications

## ✨ Features

- **Role-based Authentication** - Different interfaces for each role
- **Interactive Dashboards** - Charts and analytics for each user type
- **Project Management** - Create, assign, and track projects
- **Task Management** - Break down projects into manageable tasks
- **File Upload** - Profile image and document support
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-time Updates** - Live data synchronization

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   └── ...             # Custom components
├── pages/              # Page components organized by role
│   ├── Auth/           # Authentication pages
│   ├── Supervisor/     # Supervisor role pages
│   ├── Manager/        # Manager role pages
│   └── Member/         # Member role pages
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── utils/              # Utility functions and API calls
├── routes/             # Route configurations
└── lib/                # Library configurations
```

## Authentication

The application uses JWT-based authentication with automatic token management. Users are redirected based on their roles:

- Supervisor: Full access to all features
- Manager: Project and task management
- Member: Task viewing and updates

## API Configuration

Configure the backend API URL in `src/utils/axiosInit.js`:

```javascript
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Update for production
});
```

## Building for Production

```bash
npm run build
```

The build files will be in the `dist/` directory, ready for deployment.

## Environment Variables

For production deployment, you may need to configure:

- API base URL
- Any external service URLs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
