const jwt= require('jsonwebtoken')
const User = require('../models/userModel')

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            if (!req.user) {
                return res.status(401).json({ message: 'User not found' });
            }
            next();
        } else {
            res.status(401).json({ message: 'Not authorized, no token' });
        }
    } catch (error) {
        console.error('Error in authMiddleware:', error);
        if (error.name === 'JsonWebTokenError') {
            res.status(401).json({ message: 'Invalid token' });
        } else if (error.name === 'TokenExpiredError') {
            res.status(401).json({ message: 'Token expired' });
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};

const ManagerOnly = (req, res, next) => {
    if (req.user && req.user.role === 'manager') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied, manager only' });
    }
};

const SupervisorOnly = (req, res, next) => {
    if (req.user && req.user.role === 'supervisor') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied, supervisor only' });
    }
};

const ManagerOrSupervisor = (req, res, next) => {
    if (req.user && (req.user.role === 'manager' || req.user.role === 'supervisor')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied, manager or supervisor only' });
    }
};


module.exports = {
    authMiddleware,
    ManagerOnly,
    SupervisorOnly,
    ManagerOrSupervisor
};
 
