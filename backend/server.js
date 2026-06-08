const express = require('express');
require('dotenv').config();

const app = express();
const PORT = 5001;
// middleware
app.use(express.json());

// db connection
require('./app/models/db');

const authRoutes = require('./app/routes/authRoutes');
const bookRoutes = require('./app/routes/bookRoutes');

// test route
app.get('/', (req, res) => {
    res.send('Backend is working');
});

app.use('/auth', authRoutes);
app.use('/books', bookRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});