const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bookRoutes = require('./routes/bookRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { authenticateUser } = require('./middleware/auth');
const { checkRole } = require('./middleware/roles');

dotenv.config();
const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/admin', authenticateUser, checkRole(['admin']), adminRoutes);
app.use('/api/books', authenticateUser, checkRole(['admin', 'superadmin']), bookRoutes);
app.use('/api/superadmin', authenticateUser, checkRole(['superadmin']), superAdminRoutes);
app.use('/api/orders', authenticateUser, checkRole(['user']), orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));