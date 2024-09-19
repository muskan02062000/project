const express = require('express');
const Book = require('../models/book');
const router = express.Router();
const nodemailer = require('nodemailer');

// Add book
router.post('/book', async(req, res) => {
    try {
        const { title, author } = req.body;
        const book = new Book({ title, author, addedBy: req.user._id });
        await book.save();

        // Send email to Super Admin
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        let mailOptions = {
            from: process.env.EMAIL,
            to: process.env.SUPER_ADMIN_EMAIL,
            subject: 'New Book Created',
            text: `A new book "${title}" has been created by ${req.user.name}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) return res.status(500).json({ message: error.message });
            res.json({ message: 'Book created and email sent to Super Admin' });
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
