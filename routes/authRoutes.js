const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const router = express.Router();
const nodemailer = require('nodemailer');

const generateToken = (user) => {
    return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Register
router.post('/register', async(req, res) => {
    try {
        const { name, email, password, role } = req.body;
        let user = new User({ name, email, password, role });
        await user.hashPassword();
        await user.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login
router.post('/login', async(req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (user.sessionToken) return res.status(400).json({ message: 'User already logged in.' });

    const token = generateToken(user);
    user.sessionToken = token;
    await user.save();
    res.json({ token });
});

// Forgot Password
router.post('/forgot-password', async(req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    user.resetToken = token;
    await user.save();

    // Send reset email
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });

    let mailOptions = {
        from: process.env.EMAIL,
        to: user.email,
        subject: 'Password Reset',
        text: `Here is your reset token: ${token}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) return res.status(500).json({ message: error.message });
        res.json({ message: 'Password reset email sent' });
    });
});

// Reset Password
router.post('/reset-password', async(req, res) => {
    const { token, newPassword } = req.body;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        if (!user || user.resetToken !== token) return res.status(400).json({ message: 'Invalid token' });

        user.password = newPassword;
        await user.hashPassword();
        user.resetToken = null;
        await user.save();
        res.json({ message: 'Password reset successful' });
    } catch (err) {
        res.status(400).json({ message: 'Token expired or invalid' });
    }
});

module.exports = router;
