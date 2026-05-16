const Task = require('../models/taskModel');
const User = require('../models/userModel');
const Project = require('../models/projectModel');

// Helper function to get project IDs for supervisor
const getProjectIds = async (supervisorId) => {
    const projects = await Project.find({ createdBy: supervisorId });
    return projects.map(p => p._id);
};

// Helper function to get project IDs for manager (projects they're assigned to)
const getManagerProjectIds = async (managerId) => {
    const projects = await Project.find({ assignedTo: managerId });
    return projects.map(p => p._id);
};

const getTasks = async (req, res) => {
    try {
        const {status} = req.query;
        let filter = {};

        if (status) {
            filter.status = status;
        }        let tasks;        if(req.user.role === 'manager') {
            // Manager sees tasks from projects they're assigned to AND individual tasks they created
            const projects = await Project.find({ assignedTo: req.user._id });
            const projectIds = projects.map(p => p._id);
            tasks = await Task.find({
                ...filter, 
                $or: [
                    { projectId: { $in: projectIds } },
                    { projectId: null, createdBy: req.user._id }
                ]
            })
                .populate('assignedTo', 'name email profileImageUrl')
                .populate({
                    path: 'projectId',
                    select: 'title createdBy',
                    populate: {
                        path: 'createdBy',
                        select: 'name email profileImageUrl'
                    }
                })
                .populate('createdBy', 'name email profileImageUrl');
        } else if(req.user.role === 'supervisor') {
            // Supervisor sees tasks from their projects
            const projects = await Project.find({ createdBy: req.user._id });
            const projectIds = projects.map(p => p._id);
            tasks = await Task.find({...filter, projectId: { $in: projectIds }})
                .populate('assignedTo', 'name email profileImageUrl')
                .populate({
                    path: 'projectId',
                    select: 'title createdBy',
                    populate: {
                        path: 'createdBy',
                        select: 'name email profileImageUrl'
                    }
                })
                .populate('createdBy', 'name email profileImageUrl');        } else {
            // Members see only tasks assigned to them
            tasks = await Task.find({...filter, assignedTo : req.user._id})
                .populate('assignedTo', 'name email profileImageUrl')
                .populate({
                    path: 'projectId',
                    select: 'title createdBy',
                    populate: {
                        path: 'createdBy',
                        select: 'name email profileImageUrl'
                    }
                })
                .populate('createdBy', 'name email profileImageUrl');
                
            // Add individual member salary for each task
            tasks = tasks.map(task => {
                let individualSalary = 0;
                const userId = req.user._id;
                
                // Try to get individual salary from memberSalaries map
                if (task.memberSalaries && task.memberSalaries.get && task.memberSalaries.get(userId.toString())) {
                    individualSalary = task.memberSalaries.get(userId.toString());
                }
                // Fallback to memberSalary divided by number of assigned members
                else if (task.memberSalary && task.assignedTo && task.assignedTo.length > 0) {
                    individualSalary = task.memberSalary / task.assignedTo.length;
                }
                // Fallback to just memberSalary
                else {
                    individualSalary = task.memberSalary || 0;
                }
                
                return {
                    ...task.toObject(),
                    memberSalary: individualSalary // Replace with individual salary
                };
            });        }
        tasks = await Promise.all(tasks.map(async (task) => {
            const completedCount = task.todoChecklist.filter(item => item.completed).length;
            // Check if task is already a plain object (for members) or a Mongoose document
            const taskObj = task.toObject ? task.toObject() : task;
            return {
                ...taskObj,
                completedTodoCount: completedCount
            };
        }));

        const allTasks = await Task.countDocuments(
            req.user.role === 'manager' ? { 
                $or: [
                    { projectId: { $in: await getManagerProjectIds(req.user._id) } },
                    { projectId: null, createdBy: req.user._id }
                ]
            } : 
            req.user.role === 'supervisor' ? { projectId: { $in: await getProjectIds(req.user._id) } } :
            { assignedTo: req.user._id }
        );

        const pendingTasks = await Task.countDocuments({
            ...filter,
            status: 'pending',
            ...(req.user.role === 'manager' ? { 
                $or: [
                    { projectId: { $in: await getManagerProjectIds(req.user._id) } },
                    { projectId: null, createdBy: req.user._id }
                ]
            } : 
                req.user.role === 'supervisor' ? { projectId: { $in: await getProjectIds(req.user._id) } } :
                { assignedTo: req.user._id })
        });

        const inProgressTasks = await Task.countDocuments({
            ...filter,
            status: 'in-progress',
            ...(req.user.role === 'manager' ? { 
                $or: [
                    { projectId: { $in: await getManagerProjectIds(req.user._id) } },
                    { projectId: null, createdBy: req.user._id }
                ]
            } : 
                req.user.role === 'supervisor' ? { projectId: { $in: await getProjectIds(req.user._id) } } :
                { assignedTo: req.user._id })
        });

        const completedTasks = await Task.countDocuments({
            ...filter,
            status: 'completed',
            ...(req.user.role === 'manager' ? { 
                $or: [
                    { projectId: { $in: await getManagerProjectIds(req.user._id) } },
                    { projectId: null, createdBy: req.user._id }
                ]
            } : 
                req.user.role === 'supervisor' ? { projectId: { $in: await getProjectIds(req.user._id) } } :
                { assignedTo: req.user._id })
        });

        res.json({
            tasks,
            statusSummary: {
                allTasks,
                pendingTasks,
                inProgressTasks,
                completedTasks
            }
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate the task ID
        if (!id || id === 'undefined') {
            return res.status(400).json({ message: 'Invalid task ID' });
        }

        const task = await Task.findById(id)
            .populate('assignedTo', 'name email profileImageUrl')
            .populate('createdBy', 'name email profileImageUrl')
            .populate({
                path: 'projectId',
                select: 'title createdBy',
                populate: {
                    path: 'createdBy',
                    select: 'name email profileImageUrl'
                }
            }); 
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(200).json(task);
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const createTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate, assignedTo, attachments, todoChecklist, projectId, taskBudget, memberSalary, memberSalaries } = req.body;
        
        // Only managers can create tasks
        if (req.user.role !== 'manager') {
            return res.status(403).json({ message: 'Only managers can create tasks' });
        }

        if(!Array.isArray(assignedTo) || assignedTo.length === 0) {
            return res.status(400).json({ message: 'AssignedTo must be a non-empty array of user IDs' });
        }

        let project = null;
        let finalTaskBudget = taskBudget || 0;
        
        // Calculate task budget from member salaries if provided
        if (memberSalaries && typeof memberSalaries === 'object') {
            finalTaskBudget = Object.values(memberSalaries).reduce((sum, salary) => {
                return sum + (parseFloat(salary) || 0);
            }, 0);
        }
        
        // If projectId is provided, verify the project exists and manager has access
        if (projectId) {
            project = await Project.findById(projectId);
            if (!project) {
                return res.status(404).json({ message: 'Project not found' });
            }

            if (!project.assignedTo.includes(req.user._id)) {
                return res.status(403).json({ message: 'You are not assigned to this project' });
            }

            // Check if there's enough budget in the project
            if (finalTaskBudget > 0) {
                if (project.currentBudget < finalTaskBudget) {
                    return res.status(400).json({ message: 'Insufficient budget in project for this task' });
                }
            }
        }

        // Verify assigned users are members
        const assignedUsers = await User.find({ _id: { $in: assignedTo }, role: 'member' });
        if (assignedUsers.length !== assignedTo.length) {
            return res.status(400).json({ message: 'All assigned users must be members' });
        }        const newTask = await Task.create({
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            attachments,
            todoChecklist,
            projectId: projectId || null,
            taskBudget: finalTaskBudget,
            memberSalary: memberSalary || 0,
            memberSalaries: memberSalaries || {}, // Store individual member salaries
            status: 'pending',
            createdBy: req.user._id
        });

        // Update project budget and add task to project (only if projectId exists)
        if (project) {
            if (finalTaskBudget > 0) {
                project.currentBudget -= finalTaskBudget;
            }
            project.tasks.push(newTask._id);
            await project.save();
        }

        const populatedTask = await Task.findById(newTask._id)
            .populate('assignedTo', 'name email profileImageUrl')
            .populate('projectId', 'title')
            .populate('createdBy', 'name email');

        res.status(201).json({message: 'Task created successfully', task: populatedTask});
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('projectId');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check authorization
        if (req.user.role === 'manager' && task.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only update tasks you created' });
        }

        if (req.user.role === 'member' && !task.assignedTo.includes(req.user._id)) {
            return res.status(403).json({ message: 'You can only update tasks assigned to you' });
        }

        const { taskBudget } = req.body;
        
        // Handle budget changes (only managers can change budget)
        if (taskBudget !== undefined && req.user.role === 'manager') {
            const budgetDifference = taskBudget - task.taskBudget;
            
            if (budgetDifference > 0) {
                // Increasing budget - check if project has enough
                if (task.projectId.currentBudget < budgetDifference) {
                    return res.status(400).json({ message: 'Insufficient budget in project for this increase' });
                }
                task.projectId.currentBudget -= budgetDifference;
            } else {
                // Decreasing budget - return money to project
                task.projectId.currentBudget += Math.abs(budgetDifference);
            }
            
            await task.projectId.save();
            task.taskBudget = taskBudget;
        }

        // Update other fields
        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
        task.priority = req.body.priority || task.priority;
        task.dueDate = req.body.dueDate || task.dueDate;
        task.attachments = req.body.attachments || task.attachments;
        task.todoChecklist = req.body.todoChecklist || task.todoChecklist;

        if (req.body.assignedTo && req.user.role === 'manager') {
            if (!Array.isArray(req.body.assignedTo) || req.body.assignedTo.length === 0) {
                return res.status(400).json({ message: 'AssignedTo must be a non-empty array of user IDs' });
            }
            task.assignedTo = req.body.assignedTo;
        }

        const updatedTask = await task.save();
        const populatedTask = await Task.findById(updatedTask._id)
            .populate('assignedTo', 'name email profileImageUrl')
            .populate('projectId', 'title');
            
        res.status(200).json({ message: 'Task updated successfully', task: populatedTask });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('projectId');
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Only managers can delete tasks, and only their own tasks
        if (req.user.role !== 'manager' || task.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Only managers can delete their own tasks' });
        }

        // Return budget to project
        if (task.taskBudget > 0 && task.projectId) {
            task.projectId.currentBudget += task.taskBudget;
            
            // Remove task from project's tasks array
            task.projectId.tasks.pull(task._id);
            await task.projectId.save();
        }

        await Task.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const updateTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        const isAssigned = task.assignedTo.some(
            (userId) => userId.toString() === req.user._id.toString()
        );

        if (!isAssigned && req.user.role !== 'manager') {
            return res.status(403).json({ message: 'You are not authorized to update this task' });
        }

        task.status = req.body.status || task.status;

        if (req.body.status === 'completed' ){
            task.todoChecklist.forEach(item => {
                item.completed = true; 
            });
        }

        await task.save();
        res.status(200).json({ message: 'Task status updated successfully', task });
    } catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const updateTaskChecklist = async (req, res) => {
    try {
        const { todoChecklist } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }        // Check authorization - same logic as updateTask
        if (req.user.role === 'manager' && task.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only update tasks you created' });
        }

        if (req.user.role === 'member' && !task.assignedTo.includes(req.user._id)) {
            return res.status(403).json({ message: 'You can only update tasks assigned to you' });
        }task.todoChecklist = todoChecklist;
        
        const completedCount = todoChecklist.filter(item => item.completed).length;
        const totalItems = todoChecklist.length;
        task.progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

        if(task.progress === 100) {
            task.status = 'completed';
        }
        else if(task.progress > 0 && task.progress < 100) {
            task.status = 'in-progress';
        }
        else {
            task.status = 'pending';
        }
        
        await task.save();
        const updatedTask = await Task.findById(req.params.id).populate('assignedTo', 'name email profileImageUrl');

        res.status(200).json({ message: 'Task checklist updated successfully', task: updatedTask });
        
    } catch (error) {
        console.error('Error updating task checklist:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getDashboardData = async (req, res) => {
    try {
        // Filter tasks by current manager (assuming manager creates tasks)
        const managerId = req.user._id;
        
        if (req.user.role !== 'manager') {
            return res.status(403).json({ message: 'Only managers can access this dashboard' });
        }        // Get projects assigned to this manager to calculate total salary
        const managerProjects = await Project.find({ assignedTo: managerId });
        const totalSalary = managerProjects.reduce((sum, project) => sum + (project.managerSalary || 0), 0);
        
        // Get project IDs for this manager
        const projectIds = managerProjects.map(p => p._id);
        
        // Manager sees tasks from projects they're assigned to AND individual tasks they created
        const totalTasks = await Task.countDocuments({
            $or: [
                { projectId: { $in: projectIds } },
                { projectId: null, createdBy: managerId }
            ]
        });
        
        const completedTasks = await Task.countDocuments({
            $or: [
                { projectId: { $in: projectIds } },
                { projectId: null, createdBy: managerId }
            ],
            status: 'completed'
        });
        
        const pendingTasks = await Task.countDocuments({
            $or: [
                { projectId: { $in: projectIds } },
                { projectId: null, createdBy: managerId }
            ],
            status: 'pending'
        });

        const overdueTasks = await Task.countDocuments({
            $or: [
                { projectId: { $in: projectIds } },
                { projectId: null, createdBy: managerId }
            ],
            dueDate: { $lt: new Date() },
            status: { $ne: 'completed' }
        });
          const taskStatuses=["pending", "in-progress", "completed"];        const taskDistributionRaw= await Task.aggregate([
            { 
                $match: { 
                    $or: [
                        { projectId: { $in: projectIds } },
                        { projectId: null, createdBy: managerId }
                    ]
                } 
            },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const taskDistribution = taskStatuses.reduce((acc, status) => {
            let formattedKey;
            if (status === "in-progress") {
                formattedKey = "inprogress";
            } else {
                formattedKey = status;
            }
            acc[formattedKey] = taskDistributionRaw.find(item => item._id === status) ? taskDistributionRaw.find(item => item._id === status).count : 0;
            return acc;        }, {});
        
        taskDistribution["All"] = totalTasks;

        const taskPiorities = ["low", "medium", "high"];        const taskPriorityLevelsRaw = await Task.aggregate([
            { 
                $match: { 
                    $or: [
                        { projectId: { $in: projectIds } },
                        { projectId: null, createdBy: managerId }
                    ]
                } 
            },
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 }
                }
            }
        ]);

        const taskPriorityLevels = taskPiorities.reduce((acc, priority) => {
            const capitalizedPriority = priority.charAt(0).toUpperCase() + priority.slice(1);
            acc[capitalizedPriority] = taskPriorityLevelsRaw.find(item => item._id === priority) ? taskPriorityLevelsRaw.find(item => item._id === priority).count : 0;
            return acc;
        }, {});        const recentTasks = await Task.find({
            $or: [
                { projectId: { $in: projectIds } },
                { projectId: null, createdBy: managerId }
            ]
        }).sort({ createdAt: -1 }).limit(10).select('title status priority dueDate createdAt');
        
        const allTasks = await Task.find({
            $or: [
                { projectId: { $in: projectIds } },
                { projectId: null, createdBy: managerId }
            ]
        }).select('status priority dueDate createdAt');

        // Get projects assigned to this manager for project charts
        const allProjects = await Project.find({ assignedTo: managerId }).select('status priority dueDate createdAt title currentBudget totalBudget');

        res.status(200).json({
            statistics: {
                totalTasks,
                pendingTasks,
                completedTasks,
                overdueTasks,
                totalSalary
            },
            charts: {
                taskDistribution,
                taskPriorityLevels
            },
            recentTasks,
            allTasks,
            allProjects
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getUserDashboardData = async (req, res) => {
    try {
        const userId = req.user._id;
        const totalTasks = await Task.countDocuments({ assignedTo: userId });
        const pendingTasks = await Task.countDocuments({ assignedTo: userId, status: 'pending' });
         const completedTasks = await Task.countDocuments({ assignedTo: userId, status: 'completed' });
        const overdueTasks = await Task.countDocuments({
            assignedTo: userId,
            dueDate: { $lt: new Date() },
            status: { $ne: 'completed' }
        });

        const taskStatuses = ["Pending", "In Progress", "Completed"];
        const taskDistributionRaw = await Task.aggregate([
            { $match: { assignedTo: userId } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const taskDistribution = taskStatuses.reduce((acc, status) => {
            const formattedKey = status.replace(/\s+/g, '').toLowerCase();
            acc[formattedKey] = taskDistributionRaw.find(item => item._id === status) ? taskDistributionRaw.find(item => item._id === status).count : 0;
            return acc;
        }, {});

        taskDistribution["All"] = totalTasks;
        const taskPiorities = ["Low", "Medium", "High"];
        const taskPriorityLevelsRaw = await Task.aggregate([
            { $match: { assignedTo: userId } },
            {
                $group: {
                    _id: "$priority",
                    count: { $sum: 1 }
                }
            }
        ]);

        const taskPriorityLevels = taskPiorities.reduce((acc, priority) => {
            acc[priority] = taskPriorityLevelsRaw.find(item => item._id === priority) ? taskPriorityLevelsRaw.find(item => item._id === priority).count : 0;
            return acc;
        }, {});        // Calculate total salary received from ALL assigned tasks (regardless of status)
        const allAssignedTasks = await Task.find({ 
            assignedTo: userId 
        }).select('memberSalary memberSalaries assignedTo');
        
        const totalSalaryReceived = allAssignedTasks.reduce((sum, task) => {
            // First try to get individual salary from memberSalaries map
            if (task.memberSalaries && task.memberSalaries.get && task.memberSalaries.get(userId.toString())) {
                return sum + task.memberSalaries.get(userId.toString());
            }
            // Fallback to memberSalary divided by number of assigned members (for backward compatibility)
            else if (task.memberSalary && task.assignedTo && task.assignedTo.length > 0) {
                return sum + (task.memberSalary / task.assignedTo.length);
            }
            // Fallback to just memberSalary (for single-member tasks)
            else {
                return sum + (task.memberSalary || 0);
            }
        }, 0);        // Get all tasks for charts (including pending, in-progress, completed)
        const allTasks = await Task.find({ assignedTo: userId })
            .sort({ createdAt: -1 })
            .select('title status priority dueDate createdAt memberSalary memberSalaries assignedTo');

        // Add individual member salary to each task
        const allTasksWithIndividualSalary = allTasks.map(task => {
            let individualSalary = 0;
            
            // Try to get individual salary from memberSalaries map
            if (task.memberSalaries && task.memberSalaries.get && task.memberSalaries.get(userId.toString())) {
                individualSalary = task.memberSalaries.get(userId.toString());
            }
            // Fallback to memberSalary divided by number of assigned members
            else if (task.memberSalary && task.assignedTo && task.assignedTo.length > 0) {
                individualSalary = task.memberSalary / task.assignedTo.length;
            }
            // Fallback to just memberSalary
            else {
                individualSalary = task.memberSalary || 0;
            }
            
            return {
                ...task.toObject(),
                memberSalary: individualSalary // Replace with individual salary
            };
        });

        // For recent 10 tasks
        const recentTasks = allTasksWithIndividualSalary.slice(0, 10);        res.status(200).json({
            statistics: {
                totalTasks,
                completedTasks,
                pendingTasks,
                overdueTasks,
                totalSalaryReceived
            },
            charts: {
                taskDistribution,
                taskPriorityLevels
            },
            recentTasks,
            allTasks: allTasksWithIndividualSalary
        });
    } catch (error) {
        console.error('Error fetching user dashboard data:', error);
        res.status(500).json({ message: 'Internal server error' });    }
}

const removeUserFromTask = async (req, res) => {
    try {
        const { userId } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Only supervisors can remove users from tasks in their projects
        if (req.user.role !== 'supervisor') {
            return res.status(403).json({ message: 'Only supervisors can remove users from tasks' });
        }

        // Check if the task belongs to a project created by this supervisor
        if (task.projectId) {
            const project = await Project.findById(task.projectId);
            if (!project || project.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'You can only modify tasks in your projects' });
            }
        }

        // Remove user from assignedTo array
        task.assignedTo = task.assignedTo.filter(id => id.toString() !== userId);
        await task.save();

        const updatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'name email profileImageUrl')
            .populate('projectId', 'title');

        res.status(200).json({ message: 'User removed from task successfully', task: updatedTask });
    } catch (error) {
        console.error('Error removing user from task:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
    getDashboardData,
    getUserDashboardData,
    removeUserFromTask
};