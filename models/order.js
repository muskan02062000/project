const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    purchaseDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
