const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};


const registerUser = async (req, res) => {
    try {
        const { name, email, password, profileImageUrl, ManagerInviteToken, SupervisorInviteToken } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }        //for role
        let role = 'member';
        console.log('ManagerInviteToken:', ManagerInviteToken);
        console.log('SupervisorInviteToken:', SupervisorInviteToken);
        console.log('Expected Manager Token:', process.env.Manager_INVITE_TOKEN);
        console.log('Expected Supervisor Token:', process.env.SUPERVISOR_INVITE_TOKEN);
        
        // Check for invalid tokens
        if (SupervisorInviteToken && SupervisorInviteToken !== process.env.SUPERVISOR_INVITE_TOKEN) {
            return res.status(400).json({ message: 'Invalid Supervisor invite token' });
        }
        
        if (ManagerInviteToken && ManagerInviteToken !== process.env.Manager_INVITE_TOKEN) {
            return res.status(400).json({ message: 'Invalid Manager invite token' });
        }
        
        // Set role based on valid tokens
        if (SupervisorInviteToken && SupervisorInviteToken === process.env.SUPERVISOR_INVITE_TOKEN) {
            role = 'supervisor';
            console.log('Setting role to supervisor');
        } else if (ManagerInviteToken && ManagerInviteToken === process.env.Manager_INVITE_TOKEN) {
            role = 'manager';
            console.log('Setting role to manager');
        }
        
        console.log('Final role:', role);

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/; // At least 8 characters, one uppercase, one lowercase, one number
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, and one number' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            profileImageUrl,
            role
        });

        // Generate token
       res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            role: user.role,
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error('Error in registerUser:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate token
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            role: user.role,
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error('Error in loginUser:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error in getUserProfile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

const updateUserProfile = async (req, res) => {
    try {
        const { name, email, profileImageUrl } = req.body;
        if (!name || !email) {
            return res.status(400).json({ message: 'Please fill all fields' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Update user
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, email, profileImageUrl },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error in updateUserProfile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile
};