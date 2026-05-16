const express = require('express');
const router = express.Router();
const { 
    getProjects, 
    getProjectById, 
    createProject, 
    updateProject, 
    deleteProject, 
    updateProjectStatus,
    getDashboardData 
} = require('../controllers/projectControllers');
const { authMiddleware } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Dashboard data
router.get('/dashboard', getDashboardData);

// Project CRUD operations
router.route('/')
    .get(getProjects)
    .post(createProject);

router.route('/:id')
    .get(getProjectById)
    .put(updateProject)
    .delete(deleteProject);

// Update project status
router.put('/:id/status', updateProjectStatus);

module.exports = router;
