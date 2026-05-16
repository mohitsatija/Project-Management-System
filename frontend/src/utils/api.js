import api from './axiosInit.js';

// Auth API functions
export const authAPI = {
  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  // Upload image
  uploadImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post('/auth/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

// Task API functions
export const taskAPI = {
  // Get dashboard data (for managers)
  getDashboardData: async () => {
    const response = await api.get('/tasks/dashboard-data');
    return response.data;
  },

  // Get user dashboard data (for members)
  getUserDashboardData: async () => {
    const response = await api.get('/tasks/user-dashboard-data');
    return response.data;
  },
  // Get all tasks
  getTasks: async (status = '') => {
    const url = status ? `/tasks?status=${status}` : '/tasks';
    const response = await api.get(url);
    return response.data;
  },

  // Get task by ID
  getTaskById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Create task
  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  // Update task
  updateTask: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  // Delete task
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
  // Update task status
  updateTaskStatus: async (id, status) => {
    const response = await api.put(`/tasks/${id}/status`, { status });
    return response.data;
  },
  // Remove user from task
  removeUserFromTask: async (taskId, userId) => {
    const response = await api.put(`/tasks/${taskId}/remove-user`, { userId });
    return response.data;
  },

  // Update task checklist
  updateTaskChecklist: async (id, todoChecklist) => {
    const response = await api.put(`/tasks/${id}/todo`, { todoChecklist });
    return response.data;
  },
};

// User API functions
export const userAPI = {
  // Get all users
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Get user by ID
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
};

// Project API functions
export const projectAPI = {
  // Get dashboard data for supervisor
  getDashboardData: async () => {
    const response = await api.get('/projects/dashboard-data');
    return response.data;
  },

  // Get all projects
  getProjects: async (status = '') => {
    const params = status ? { status } : {};
    const response = await api.get('/projects', { params });
    return response.data;
  },

  // Get project by ID
  getProject: async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },

  // Create new project
  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  // Update project
  updateProject: async (projectId, projectData) => {
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response.data;
  },

  // Delete project
  deleteProject: async (projectId) => {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  },

  // Update project status
  updateProjectStatus: async (projectId, status) => {
    const response = await api.patch(`/projects/${projectId}/status`, { status });
    return response.data;
  },
  // Get project overview for supervisor
  getProjectOverview: async () => {
    const response = await api.get('/supervisor/projects/overview');
    return response.data;
  },
};

// Supervisor API functions
export const supervisorAPI = {
  // Get supervisor dashboard data
  getSupervisorDashboard: async () => {
    const response = await api.get('/supervisor/dashboard');
    return response.data;
  },

  // Get managers
  getManagers: async () => {
    const response = await api.get('/supervisor/managers');
    return response.data;
  },

  // Get members
  getMembers: async () => {
    const response = await api.get('/supervisor/members');
    return response.data;
  },

  // Get project overview
  getProjectOverview: async () => {
    const response = await api.get('/supervisor/projects/overview');
    return response.data;
  },
  // Allocate budget
  allocateBudget: async (projectId, additionalBudget) => {
    const response = await api.post('/supervisor/allocate-budget', {
      projectId,
      additionalBudget
    });
    return response.data;
  },
};

// Report API functions
export const reportAPI = {
  // Download projects report (for supervisors)
  downloadProjectsReport: async () => {
    const response = await api.get('/reports/export/projects', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Download managers report (for supervisors)
  downloadManagersReport: async () => {
    const response = await api.get('/reports/export/managers', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Download tasks report (for managers)
  downloadTasksReport: async () => {
    const response = await api.get('/reports/export/tasks', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Download users report (for managers)
  downloadUsersReport: async () => {
    const response = await api.get('/reports/export/users', {
      responseType: 'blob'
    });
    return response.data;
  },
};

// Helper functions for token and user management
export const authUtils = {
  // Save user data to localStorage
  saveUserData: (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
  },

  // Get user data from localStorage
  getUserData: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Clear user data from localStorage
  clearUserData: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return !!localStorage.getItem('token');
  },
};