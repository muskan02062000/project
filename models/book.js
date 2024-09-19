const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    isApproved: { type: Boolean, default: false },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    visibleToUsers: { type: Boolean, default: false }
});

module.exports = mongoose.model('Book', bookSchema);
