const Task = require('../models/taskModel');
const User = require('../models/userModel');
const Project = require('../models/projectModel');

const excelJS = require('exceljs');

const exportTasksReport = async (req, res) => {
    try {
        // Only managers can export tasks report
        if (req.user.role !== 'manager') {
            return res.status(403).json({ message: 'Only managers can export tasks report' });
        }

        // Get projects assigned to this manager
        const projects = await Project.find({ assignedTo: req.user._id });
        const projectIds = projects.map(p => p._id);

        // Get tasks from projects this manager is assigned to
        const tasks = await Task.find({ projectId: { $in: projectIds } })
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .populate('projectId', 'title');

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('Tasks Report');
        worksheet.columns = [
            { header: 'Task ID', key: 'taskId', width: 15 },
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Description', key: 'description', width: 50 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Priority', key: 'priority', width: 15 },
            { header: 'Project', key: 'project', width: 25 },
            { header: 'Created By', key: 'createdBy', width: 25 },
            { header: 'Assigned To', key: 'assignedTo', width: 30 },
            { header: 'Task Budget', key: 'taskBudget', width: 15 },
            { header: 'Due Date', key: 'dueDate', width: 20 },
            { header: 'Progress', key: 'progress', width: 15 },
        ];

        tasks.forEach(task => {
            const assignedUsers = task.assignedTo.map(user => user.name).join(', ');
            
            worksheet.addRow({
                taskId: task._id,
                title: task.title,
                description: task.description || 'No description',
                status: task.status,
                priority: task.priority,
                project: task.projectId?.title || 'No project',
                createdBy: task.createdBy?.name || 'Unknown',
                assignedTo: assignedUsers || "Unassigned",
                taskBudget: task.taskBudget || 0,
                dueDate: task.dueDate.toISOString().split('T')[0],
                progress: `${task.progress || 0}%`,
            });
        });

        res.setHeader('Content-Disposition', 'attachment; filename=tasks_report.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        
        return workbook.xlsx.write(res)
            .then(() => {
                res.status(200).end();
            })
            .catch(error => {
                console.error('Error writing Excel file:', error);
                res.status(500).json({ message: 'Error generating report' });
            });

    } catch (error) {
        console.error('Error exporting tasks report:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const exportUsersReport = async (req, res) => {
    try {
        // Only managers can export users report
        if (req.user.role !== 'manager') {
            return res.status(403).json({ message: 'Only managers can export users report' });
        }

        // Get projects assigned to this manager
        const projects = await Project.find({ assignedTo: req.user._id });
        const projectIds = projects.map(p => p._id);

        // Get tasks from projects this manager is assigned to
        const tasks = await Task.find({ projectId: { $in: projectIds } })
            .populate('assignedTo', 'name email _id role');

        // Get unique users from these tasks (members only)
        const userIds = new Set();
        tasks.forEach(task => {
            task.assignedTo.forEach(user => {
                if (user.role === 'member') {
                    userIds.add(user._id.toString());
                }
            });
        });

        const users = await User.find({ 
            _id: { $in: Array.from(userIds) }, 
            role: 'member' 
        }).select('name email _id').lean();

        const userTaskMap = {};

        users.forEach(user => {
            userTaskMap[user._id] = {
                name: user.name,
                email: user.email,
                taskCount: 0,
                pendingTasks: 0,
                inProgressTasks: 0,
                completedTasks: 0,
                totalBudgetReceived: 0,
            };
        });

        tasks.forEach(task => {
            task.assignedTo.forEach(user => {
                if (user.role === 'member') {
                    const userId = user._id.toString();
                    if (userTaskMap[userId]) {
                        userTaskMap[userId].taskCount += 1;
                        userTaskMap[userId].totalBudgetReceived += task.taskBudget || 0;
                        
                        if (task.status === 'pending') {
                            userTaskMap[userId].pendingTasks += 1;
                        } else if (task.status === 'in-progress') {
                            userTaskMap[userId].inProgressTasks += 1;
                        } else if (task.status === 'completed') {
                            userTaskMap[userId].completedTasks += 1;
                        }
                    }
                }
            });
        });
        
        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('Users Report');

        worksheet.columns = [
            { header: 'Name', key: 'name', width: 30 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Total Tasks', key: 'taskCount', width: 15 },
            { header: 'Pending Tasks', key: 'pendingTasks', width: 15 },
            { header: 'In Progress Tasks', key: 'inProgressTasks', width: 20 },
            { header: 'Completed Tasks', key: 'completedTasks', width: 20 },
            { header: 'Total Budget Received', key: 'totalBudgetReceived', width: 25 },
        ];

        Object.values(userTaskMap).forEach(user => {
            worksheet.addRow({
                name: user.name,
                email: user.email,
                taskCount: user.taskCount,
                pendingTasks: user.pendingTasks,
                inProgressTasks: user.inProgressTasks,
                completedTasks: user.completedTasks,
                totalBudgetReceived: user.totalBudgetReceived,
            });
        });

        res.setHeader('Content-Disposition', 'attachment; filename=users_report.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        return workbook.xlsx.write(res)
            .then(() => {
                res.status(200).end();
            })
            .catch(error => {
                console.error('Error writing Excel file:', error);
                res.status(500).json({ message: 'Error generating report' });
            });
    } catch (error) {
        console.error('Error exporting users report:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// Supervisor Reports
const exportProjectsReport = async (req, res) => {
    try {
        // Only supervisors can export projects report
        if (req.user.role !== 'supervisor') {
            return res.status(403).json({ message: 'Only supervisors can export projects report' });
        }

        const projects = await Project.find({ createdBy: req.user._id })
            .populate('assignedTo', 'name email')
            .populate('createdBy', 'name email')
            .populate('tasks');

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('Projects Report');
        
        worksheet.columns = [
            { header: 'Project ID', key: 'projectId', width: 15 },
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Description', key: 'description', width: 50 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Priority', key: 'priority', width: 15 },
            { header: 'Assigned Managers', key: 'assignedManagers', width: 40 },
            { header: 'Due Date', key: 'dueDate', width: 20 },
            { header: 'Total Budget', key: 'totalBudget', width: 15 },
            { header: 'Current Budget', key: 'currentBudget', width: 15 },
            { header: 'Budget Used', key: 'budgetUsed', width: 15 },
            { header: 'Manager Salary', key: 'managerSalary', width: 15 },
            { header: 'Total Tasks', key: 'totalTasks', width: 15 },
            { header: 'Progress', key: 'progress', width: 15 },
        ];

        projects.forEach(project => {
            const managerNames = project.assignedTo.map(manager => manager.name).join(', ');
            const budgetUsed = project.totalBudget - project.currentBudget;
            
            worksheet.addRow({
                projectId: project._id,
                title: project.title,
                description: project.description || 'No description',
                status: project.status,
                priority: project.priority,
                assignedManagers: managerNames || 'No managers assigned',
                dueDate: project.dueDate.toISOString().split('T')[0],
                totalBudget: project.totalBudget,
                currentBudget: project.currentBudget,
                budgetUsed: budgetUsed,
                managerSalary: project.managerSalary,
                totalTasks: project.tasks.length,
                progress: `${project.progress}%`,
            });
        });

        res.setHeader('Content-Disposition', 'attachment; filename=projects_report.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        
        return workbook.xlsx.write(res)
            .then(() => {
                res.status(200).end();
            })
            .catch(error => {
                console.error('Error writing Excel file:', error);
                res.status(500).json({ message: 'Error generating report' });
            });

    } catch (error) {
        console.error('Error exporting projects report:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const exportManagersReport = async (req, res) => {
    try {
        // Only supervisors can export managers report
        if (req.user.role !== 'supervisor') {
            return res.status(403).json({ message: 'Only supervisors can export managers report' });
        }

        // Get all projects created by this supervisor
        const projects = await Project.find({ createdBy: req.user._id })
            .populate('assignedTo', 'name email');

        // Get all tasks from supervisor's projects
        const projectIds = projects.map(p => p._id);
        const allTasks = await Task.find({ projectId: { $in: projectIds } })
            .populate('createdBy', 'name email _id');

        // Get all managers assigned to supervisor's projects
        const managerIds = new Set();
        projects.forEach(project => {
            project.assignedTo.forEach(manager => {
                managerIds.add(manager._id.toString());
            });
        });

        const managers = await User.find({ 
            _id: { $in: Array.from(managerIds) }, 
            role: 'manager' 
        }).select('name email _id').lean();

        // Calculate manager statistics
        const managerProjectMap = {};
        
        managers.forEach(manager => {
            managerProjectMap[manager._id] = {
                name: manager.name,
                email: manager.email,
                projectCount: 0,
                totalTasksCreated: 0,
                pendingTasks: 0,
                inProgressTasks: 0,
                completedTasks: 0,
                totalBudgetAllocated: 0,
                currentBudgetAvailable: 0,
                totalSalaryReceived: 0,
                budgetSpentOnTasks: 0,
            };
        });

        // Calculate statistics for each manager
        projects.forEach(project => {
            project.assignedTo.forEach(manager => {
                const managerId = manager._id.toString();
                if (managerProjectMap[managerId]) {
                    managerProjectMap[managerId].projectCount += 1;
                    managerProjectMap[managerId].totalBudgetAllocated += project.totalBudget;
                    managerProjectMap[managerId].currentBudgetAvailable += project.currentBudget;
                    managerProjectMap[managerId].totalSalaryReceived += project.managerSalary;
                }
            });
        });

        // Count tasks created by each manager and budget spent
        allTasks.forEach(task => {
            if (task.createdBy) {
                const managerId = task.createdBy._id.toString();
                if (managerProjectMap[managerId]) {
                    managerProjectMap[managerId].totalTasksCreated += 1;
                    managerProjectMap[managerId].budgetSpentOnTasks += task.taskBudget || 0;
                    
                    if (task.status === 'pending') {
                        managerProjectMap[managerId].pendingTasks += 1;
                    } else if (task.status === 'in-progress') {
                        managerProjectMap[managerId].inProgressTasks += 1;
                    } else if (task.status === 'completed') {
                        managerProjectMap[managerId].completedTasks += 1;
                    }
                }
            }
        });

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('Managers Report');
        
        worksheet.columns = [
            { header: 'Manager Name', key: 'name', width: 30 },
            { header: 'Email', key: 'email', width: 30 },
            { header: 'Projects Assigned', key: 'projectCount', width: 20 },
            { header: 'Tasks Created', key: 'totalTasksCreated', width: 15 },
            { header: 'Pending Tasks', key: 'pendingTasks', width: 15 },
            { header: 'In Progress Tasks', key: 'inProgressTasks', width: 20 },
            { header: 'Completed Tasks', key: 'completedTasks', width: 20 },
            { header: 'Total Budget Allocated', key: 'totalBudgetAllocated', width: 25 },
            { header: 'Current Budget Available', key: 'currentBudgetAvailable', width: 25 },
            { header: 'Budget Spent on Tasks', key: 'budgetSpentOnTasks', width: 25 },
            { header: 'Total Salary Received', key: 'totalSalaryReceived', width: 25 },
        ];

        Object.values(managerProjectMap).forEach(manager => {
            worksheet.addRow({
                name: manager.name,
                email: manager.email,
                projectCount: manager.projectCount,
                totalTasksCreated: manager.totalTasksCreated,
                pendingTasks: manager.pendingTasks,
                inProgressTasks: manager.inProgressTasks,
                completedTasks: manager.completedTasks,
                totalBudgetAllocated: manager.totalBudgetAllocated,
                currentBudgetAvailable: manager.currentBudgetAvailable,
                budgetSpentOnTasks: manager.budgetSpentOnTasks,
                totalSalaryReceived: manager.totalSalaryReceived,
            });
        });

        res.setHeader('Content-Disposition', 'attachment; filename=managers_report.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        return workbook.xlsx.write(res)
            .then(() => {
                res.status(200).end();
            })
            .catch(error => {
                console.error('Error writing Excel file:', error);
                res.status(500).json({ message: 'Error generating report' });
            });

    } catch (error) {
        console.error('Error exporting managers report:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = {
    exportTasksReport,
    exportUsersReport,
    exportProjectsReport,
    exportManagersReport
};
