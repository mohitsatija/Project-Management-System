const Task = require('../models/taskModel');
const User = require('../models/userModel');
const bycrypt = require('bcryptjs');



const getUsers = async (req, res) => {
    try {
        const users = await User.find({role: 'member'}).select('-password');

        const usersWithTaskCount = await Promise.all(users.map(async (user) => {
            const pendingTasks = await Task.countDocuments({assignedTo: user._id, status: 'pending'});
            const inProgressTasks = await Task.countDocuments({assignedTo: user._id, status: 'in-progress'});   
            const completedTasks = await Task.countDocuments({assignedTo: user._id, status: 'completed'});

            return {
                ...user.toObject(),
                pendingTasks,
                inProgressTasks,
                completedTasks
            };
        }));
        res.status(200).json(usersWithTaskCount);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getUserById = async (req, res) => {
   
    try {
         const user= await User.findById(req.params._id).select('-password');
    if(!user) {
        return res.status(404).json({ message: 'User not found' });
    }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    getUsers,
    getUserById
};