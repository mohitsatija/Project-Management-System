const express = require('express');
const {authMiddleware, ManagerOnly} = require('../middlewares/authMiddleware');
const { get } = require('mongoose');
const {
    getDashboardData,
    getUserDashboardData,
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
    removeUserFromTask
} = require('../controllers/taskControllers');


const router = express.Router();

// Task management routes
router.get("/dashboard-data",authMiddleware, getDashboardData);
router.get("/user-dashboard-data", authMiddleware, getUserDashboardData);
router.get("/", authMiddleware, getTasks);
router.get("/:id", authMiddleware, getTaskById);
router.post("/", authMiddleware,ManagerOnly, createTask);
router.put("/:id", authMiddleware, updateTask);
router.delete("/:id", authMiddleware,ManagerOnly, deleteTask);
router.put("/:id/status", authMiddleware, updateTaskStatus);
router.put("/:id/todo", authMiddleware, updateTaskChecklist);
router.put("/:id/remove-user", authMiddleware, removeUserFromTask);

module.exports = router;