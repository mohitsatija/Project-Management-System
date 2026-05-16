const express= require("express");
const router = express.Router();
const {authMiddleware,ManagerOnly} = require("../middlewares/authMiddleware");
const { 
    exportTasksReport, 
    exportUsersReport,
    exportProjectsReport,
    exportManagersReport
} = require("../controllers/reportControllers");

// Manager Reports
router.get("/export/tasks",authMiddleware,ManagerOnly, exportTasksReport);
router.get("/export/users",authMiddleware,ManagerOnly, exportUsersReport);

// Supervisor Reports  
router.get("/export/projects",authMiddleware, exportProjectsReport);
router.get("/export/managers",authMiddleware, exportManagersReport);

module.exports = router;