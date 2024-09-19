const express = require('express');
const Book = require('../models/book');
const router = express.Router();

// Get all books (visible to users or all books depending on the role)
router.get('/', async(req, res) => {
    let books;
    if (req.user.role === 'user') {
        books = await Book.find({ visibleToUsers: true });
    } else {
        books = await Book.find();
    }
    res.json(books);
});

// Get a specific book by ID
router.get('/:id', async(req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        res.json(book);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a book by Admin
router.put('/:id', async(req, res) => {
    try {
        const { title, author } = req.body;
        let book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });

        if (book.addedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not allowed to update this book' });
        }

        book.title = title || book.title;
        book.author = author || book.author;
        await book.save();

        res.json({ message: 'Book updated successfully', book });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete a book by Admin
router.delete('/:id', async(req, res) => {
    try {
        let book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });

        if (book.addedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not allowed to delete this book' });
        }

        await book.remove();
        res.json({ message: 'Book deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
