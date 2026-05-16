const express = require('express');
const router = express.Router();
const { 
    getManagers, 
    getMembers, 
    getSupervisorDashboard,
    getProjectOverview,
    allocateBudget
} = require('../controllers/supervisorControllers');
const { authMiddleware } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Dashboard data for supervisors
router.get('/dashboard', getSupervisorDashboard);

// Get managers and members
router.get('/managers', getManagers);
router.get('/members', getMembers);

// Project overview
router.get('/projects/overview', getProjectOverview);

// Budget allocation
router.post('/allocate-budget', allocateBudget);

module.exports = router;
