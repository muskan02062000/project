const express = require('express');
const Book = require('../models/book');
const User = require('../models/user');
const router = express.Router();
const nodemailer = require('nodemailer');

// Approve or reject a book
router.post('/approve/:id', async(req, res) => {
    try {
        const { action } = req.body; // action should be 'approve' or 'reject'
        let book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });

        if (action === 'approve') {
            book.isApproved = true;
            book.visibleToUsers = true;
        } else if (action === 'reject') {
            book.isApproved = false;
            book.visibleToUsers = false;
            // Notify the Admin who added the book
            const admin = await User.findById(book.addedBy);
            if (!admin) return res.status(404).json({ message: 'Admin not found' });

            // Send rejection email to Admin
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.PASSWORD
                }
            });

            let mailOptions = {
                from: process.env.EMAIL,
                to: admin.email,
                subject: 'Book Rejection Notice',
                text: `Your book "${book.title}" was rejected by the Super Admin.`
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) return res.status(500).json({ message: error.message });
            });
        }

        await book.save();
        res.json({ message: `Book has been ${action === 'approve' ? 'approved' : 'rejected'}` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add Admin by Super Admin
router.post('/add-admin', async(req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = new User({ name, email, password, role: 'admin' });
        await user.hashPassword();
        await user.save();

        // Send email with login details
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        let mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Admin Account Created',
            text: `Your admin account has been created. You can log in with email: ${email}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) return res.status(500).json({ message: error.message });
            res.json({ message: 'Admin created and email sent' });
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
