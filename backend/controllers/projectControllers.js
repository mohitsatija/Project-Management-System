const Project = require('../models/projectModel');
const User = require('../models/userModel');
const Task = require('../models/taskModel');

const getProjects = async (req, res) => {
    try {
        const {status} = req.query;
        let filter = {};

        if (status) {
            filter.status = status;
        }          let projects;
        let userTasks = []; // Initialize for member role
        
        if(req.user.role === 'supervisor') {
            // Supervisor sees only projects they created
            projects = await Project.find({...filter, createdBy: req.user._id})
                .populate('assignedTo', 'name email profileImageUrl')
                .populate('tasks')
                .populate('createdBy', 'name email');
        } else if(req.user.role === 'manager') {
            // Manager sees only projects assigned to them by any supervisor
            projects = await Project.find({...filter, assignedTo : req.user._id})
                .populate('assignedTo', 'name email profileImageUrl')
                .populate('tasks')
                .populate('createdBy', 'name email');
        } else if(req.user.role === 'member') {
            // Members see projects where they have assigned tasks
            userTasks = await Task.find({ assignedTo: req.user._id }).distinct('projectId');
            projects = await Project.find({...filter, _id: { $in: userTasks }})
                .populate('assignedTo', 'name email profileImageUrl')
                .populate('tasks')
                .populate('createdBy', 'name email');
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }const allProjects = await Project.countDocuments(
            req.user.role === 'supervisor' ? { createdBy: req.user._id } : 
            req.user.role === 'manager' ? { assignedTo: req.user._id } :
            req.user.role === 'member' ? { _id: { $in: userTasks || [] } } :
            {}
        );

        const pendingProjects = await Project.countDocuments({
            ...filter,
            status: 'pending',
            ...(req.user.role === 'supervisor' ? { createdBy: req.user._id } : 
                req.user.role === 'manager' ? { assignedTo: req.user._id } :
                req.user.role === 'member' ? { _id: { $in: userTasks || [] } } :
                {})
        });

        const inProgressProjects = await Project.countDocuments({
            ...filter,
            status: 'in-progress',
            ...(req.user.role === 'supervisor' ? { createdBy: req.user._id } : 
                req.user.role === 'manager' ? { assignedTo: req.user._id } :
                req.user.role === 'member' ? { _id: { $in: userTasks || [] } } :
                {})
        });

        const completedProjects = await Project.countDocuments({
            ...filter,
            status: 'completed',
            ...(req.user.role === 'supervisor' ? { createdBy: req.user._id } : 
                req.user.role === 'manager' ? { assignedTo: req.user._id } :
                req.user.role === 'member' ? { _id: { $in: userTasks || [] } } :
                {})
        });

        res.json({
            projects,
            statusSummary: {
                allProjects,
                pendingProjects,
                inProgressProjects,
                completedProjects
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('assignedTo', 'name email profileImageUrl')
            .populate('createdBy', 'name email profileImageUrl')
            .populate({
                path: 'tasks',
                populate: {
                    path: 'assignedTo',
                    select: 'name email profileImageUrl'
                }
            });
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }        // Check if user has access to this project
        if (req.user.role === 'supervisor' && project.createdBy._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        if (req.user.role === 'manager' && !project.assignedTo.some(user => user._id.toString() === req.user._id.toString())) {
            return res.status(403).json({ message: 'Access denied' });
        }        if (req.user.role === 'member') {
            // Check if member has any tasks in this project
            const memberTasks = await Task.findOne({ 
                projectId: req.params.id, 
                assignedTo: req.user._id 
            });
            if (!memberTasks) {
                return res.status(403).json({ message: 'Access denied' });
            }
        }

        res.json({ project });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createProject = async (req, res) => {
    try {
        const { title, description, priority, dueDate, assignedTo, totalBudget, managerSalary, attachments } = req.body;

        // Only supervisors can create projects
        if (req.user.role !== 'supervisor') {
            return res.status(403).json({ message: 'Only supervisors can create projects' });
        }

        const project = new Project({
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            createdBy: req.user._id,
            totalBudget,
            currentBudget: totalBudget,
            managerSalary,
            attachments: attachments || []
        });

        await project.save();
        const populatedProject = await Project.findById(project._id)
            .populate('assignedTo', 'name email profileImageUrl')
            .populate('createdBy', 'name email profileImageUrl');

        res.status(201).json(populatedProject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if user has permission to update
        if (req.user.role === 'supervisor' && project.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }
        
        if (req.user.role === 'manager' && !project.assignedTo.includes(req.user._id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('assignedTo', 'name email profileImageUrl')
         .populate('createdBy', 'name email profileImageUrl');

        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Only supervisors can delete projects
        if (req.user.role !== 'supervisor' || project.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await Project.findByIdAndDelete(req.params.id);
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProjectStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Calculate progress based on completed tasks
        const tasks = await Task.find({ projectId: req.params.id });
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            { status, progress },
            { new: true }
        ).populate('assignedTo', 'name email profileImageUrl')
         .populate('createdBy', 'name email profileImageUrl');

        res.json(updatedProject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDashboardData = async (req, res) => {
    try {
        let filter = {};
        
        if (req.user.role === 'supervisor') {
            filter.createdBy = req.user._id;
        } else if (req.user.role === 'manager') {
            filter.assignedTo = req.user._id;
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }

        const totalProjects = await Project.countDocuments(filter);
        const pendingProjects = await Project.countDocuments({ ...filter, status: 'pending' });
        const inProgressProjects = await Project.countDocuments({ ...filter, status: 'in-progress' });
        const completedProjects = await Project.countDocuments({ ...filter, status: 'completed' });

        // Get recent projects
        const recentProjects = await Project.find(filter)
            .populate('assignedTo', 'name email profileImageUrl')
            .sort({ createdAt: -1 })
            .limit(5);

        // Budget analytics for supervisor
        let budgetData = {};
        if (req.user.role === 'supervisor') {
            const projects = await Project.find(filter);
            const totalBudgetAllocated = projects.reduce((sum, project) => sum + project.totalBudget, 0);
            const totalBudgetUsed = projects.reduce((sum, project) => sum + (project.totalBudget - project.currentBudget), 0);
            
            budgetData = {
                totalBudgetAllocated,
                totalBudgetUsed,
                remainingBudget: totalBudgetAllocated - totalBudgetUsed
            };
        }

        res.json({
            totalProjects,
            pendingProjects,
            inProgressProjects,
            completedProjects,
            recentProjects,
            budgetData
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    updateProjectStatus,
    getDashboardData
};
