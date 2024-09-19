const express = require('express');
const Order = require('../models/order');
const Book = require('../models/book');
const router = express.Router();
const nodemailer = require('nodemailer');

// Purchase a book
router.post('/purchase/:bookId', async(req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        if (!book || !book.visibleToUsers) {
            return res.status(404).json({ message: 'Book not available for purchase' });
        }

        const order = new Order({
            book: book._id,
            user: req.user._id
        });
        await order.save();

        // Notify Super Admin of new order
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
            subject: 'New Book Purchase',
            text: `A new order has been placed for the book "${book.title}" by ${req.user.name}.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) return res.status(500).json({ message: error.message });
            res.json({ message: 'Order placed and email sent to Super Admin' });
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
