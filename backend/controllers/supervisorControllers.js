const User = require('../models/userModel');
const Project = require('../models/projectModel');
const Task = require('../models/taskModel');

// Get all managers under a supervisor
const getManagers = async (req, res) => {
    try {
        if (req.user.role !== 'supervisor') {
            return res.status(403).json({ message: 'Only supervisors can view managers' });
        }

        const managers = await User.find({ role: 'manager' }).select('-password');
        res.status(200).json(managers);
    } catch (error) {
        console.error('Error fetching managers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all members (for assigning to tasks)
const getMembers = async (req, res) => {
    try {
        if (req.user.role === 'member') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const members = await User.find({ role: 'member' }).select('-password');
        res.status(200).json(members);
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get supervisor dashboard data
const getSupervisorDashboard = async (req, res) => {
    try {
        if (req.user.role !== 'supervisor') {
            return res.status(403).json({ message: 'Only supervisors can access this dashboard' });
        }

        const supervisorId = req.user._id;

        // Project statistics
        const totalProjects = await Project.countDocuments({ createdBy: supervisorId });
        const completedProjects = await Project.countDocuments({ createdBy: supervisorId, status: 'completed' });
        const inProgressProjects = await Project.countDocuments({ createdBy: supervisorId, status: 'in-progress' });
        const pendingProjects = await Project.countDocuments({ createdBy: supervisorId, status: 'pending' });

        // Budget statistics
        const projects = await Project.find({ createdBy: supervisorId });
        const totalBudgetAllocated = projects.reduce((sum, project) => sum + project.totalBudget, 0);
        const totalBudgetUsed = projects.reduce((sum, project) => sum + (project.totalBudget - project.currentBudget), 0);
        const remainingBudget = totalBudgetAllocated - totalBudgetUsed;

        // Task statistics from all projects
        const projectIds = projects.map(p => p._id);
        const totalTasks = await Task.countDocuments({ projectId: { $in: projectIds } });
        const completedTasks = await Task.countDocuments({ projectId: { $in: projectIds }, status: 'completed' });
        const inProgressTasks = await Task.countDocuments({ projectId: { $in: projectIds }, status: 'in-progress' });
        const pendingTasks = await Task.countDocuments({ projectId: { $in: projectIds }, status: 'pending' });        // Recent projects
        const recentProjects = await Project.find({ createdBy: supervisorId })
            .populate('assignedTo', 'name email profileImageUrl')
            .sort({ createdAt: -1 })
            .limit(5);

        // Get all projects with full data for charts
        const allProjects = await Project.find({ createdBy: supervisorId })
            .populate('assignedTo', 'name email profileImageUrl')
            .populate({
                path: 'tasks',
                populate: {
                    path: 'assignedTo',
                    select: 'name email'
                }
            });

        // Manager performance
        const managerPerformance = await Project.aggregate([
            { $match: { createdBy: supervisorId } },
            { $unwind: '$assignedTo' },
            {
                $group: {
                    _id: '$assignedTo',
                    projectsAssigned: { $sum: 1 },
                    completedProjects: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'managerInfo'
                }
            },
            { $unwind: '$managerInfo' },
            {
                $project: {
                    name: '$managerInfo.name',
                    email: '$managerInfo.email',
                    projectsAssigned: 1,
                    completedProjects: 1,
                    completionRate: {
                        $cond: [
                            { $gt: ['$projectsAssigned', 0] },
                            { $multiply: [{ $divide: ['$completedProjects', '$projectsAssigned'] }, 100] },
                            0
                        ]
                    }
                }
            }
        ]);

        res.status(200).json({
            projectStats: {
                totalProjects,
                completedProjects,
                inProgressProjects,
                pendingProjects
            },
            budgetStats: {
                totalBudgetAllocated,
                totalBudgetUsed,
                remainingBudget
            },
            taskStats: {
                totalTasks,
                completedTasks,
                inProgressTasks,
                pendingTasks
            },
            recentProjects,
            allProjects, // Add this for charts
            managerPerformance
        });
    } catch (error) {
        console.error('Error fetching supervisor dashboard data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all projects and their tasks for overview
const getProjectOverview = async (req, res) => {
    try {
        if (req.user.role !== 'supervisor') {
            return res.status(403).json({ message: 'Only supervisors can view project overview' });
        }

        const projects = await Project.find({ createdBy: req.user._id })
            .populate('assignedTo', 'name email profileImageUrl')
            .populate({
                path: 'tasks',
                populate: {
                    path: 'assignedTo',
                    select: 'name email'
                }
            });

        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching project overview:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Allocate additional budget to a project
const allocateBudget = async (req, res) => {
    try {
        if (req.user.role !== 'supervisor') {
            return res.status(403).json({ message: 'Only supervisors can allocate budget' });
        }

        const { projectId, additionalBudget } = req.body;

        if (!projectId || !additionalBudget || additionalBudget <= 0) {
            return res.status(400).json({ message: 'Project ID and positive additional budget are required' });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only allocate budget to your own projects' });
        }

        project.totalBudget += additionalBudget;
        project.currentBudget += additionalBudget;
        await project.save();

        res.status(200).json({
            message: 'Budget allocated successfully',
            project: await Project.findById(projectId)
                .populate('assignedTo', 'name email')
                .populate('createdBy', 'name email')
        });
    } catch (error) {
        console.error('Error allocating budget:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getManagers,
    getMembers,
    getSupervisorDashboard,
    getProjectOverview,
    allocateBudget
};
