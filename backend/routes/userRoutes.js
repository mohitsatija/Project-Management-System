const express = require('express');
const {ManagerOnly, authMiddleware} = require('../middlewares/authMiddleware');
const {getUsers, getUserById} = require('../controllers/userControllers');

const router = express.Router();

//user management routes
router.get('/',authMiddleware,ManagerOnly, getUsers);
router.get('/:id',authMiddleware,getUserById);

module.exports = router;