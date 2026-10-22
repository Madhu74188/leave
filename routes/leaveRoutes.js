
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const {
            username,
            email,
            rollNumber,
            casualLeave,
            medicalLeave
        } = req.body;

        if (!username || !email || !rollNumber) {
            return res.status(400).json({
                message: 'Please fill in all required fields.'
            });
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { rollNumber }]
        });

        if (existingUser) {
            return res.status(409).json({
                message: 'Email or roll number is already registered.'
            });
        }

        const user = new User({
            username,
            email,
            rollNumber,
            casualLeave: Number.isInteger(Number(casualLeave))
                ? Number(casualLeave) : 0,
            medicalLeave: Number.isInteger(Number(medicalLeave))
                ? Number(medicalLeave) : 0
        });

        await user.save();

        res.status(201).json({
            message: 'Registration successful!'
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            message: 'Error registering user.'
        });
    }
});

// Login using email
router.post('/login', async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({
            email: email?.trim()
        });

        if (!user) {
            return res.status(404).json({
                message: 'User not found. Please register first.'
            });
        }

        res.json({
            message: 'Login successful!',
            userId: user._id,
            username: user.username,
            email: user.email,
            rollNumber: user.rollNumber,
            casualLeave: user.casualLeave,
            medicalLeave: user.medicalLeave
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Error logging in.'
        });
    }
});

// Get leave balance
router.get('/leave-balance/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        res.json({
            casualLeave: user.casualLeave,
            medicalLeave: user.medicalLeave
        });
    } catch (error) {
        console.error('Leave balance error:', error);
        res.status(500).json({
            message: 'Error fetching leave balance.'
        });
    }
});

// Apply for leave
router.post('/apply-leave/:userId', async (req, res) => {
    try {
        const { type, days } = req.body;
        const leaveDays = Number(days);

        if (!Number.isInteger(leaveDays) || leaveDays <= 0) {
            return res.status(400).json({
                message: 'Enter a valid number of leave days.'
            });
        }

        if (!['casual', 'medical'].includes(type)) {
            return res.status(400).json({
                message: 'Invalid leave type.'
            });
        }

        const user = await User.findById(req.params.userId);

        if (!user) {
            return res.status(404).json({
                message: 'User not found.'
            });
        }

        if (type === 'casual') {
            if (user.casualLeave < leaveDays) {
                return res.status(400).json({
                    message: 'Insufficient casual leave balance.'
                });
            }

            user.casualLeave -= leaveDays;
        } else if (type === 'medical') {
            if (user.medicalLeave < leaveDays) {
                return res.status(400).json({
                    message: 'Insufficient medical leave balance.'
                });
            }

            user.medicalLeave -= leaveDays;
        }

        await user.save();

        res.json({
            message: 'Leave applied successfully!',
            casualLeave: user.casualLeave,
            medicalLeave: user.medicalLeave
        });
    } catch (error) {
        console.error('Apply leave error:', error);
        res.status(500).json({
            message: 'Error applying for leave.'
        });
    }
});

module.exports = router;
