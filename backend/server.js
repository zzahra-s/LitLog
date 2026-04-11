const express = require('express');
require('dotenv').config();

const cors = require('cors');

const app = express();
const PORT = 5001;
// middleware
app.use(express.json());
app.use(cors());

// db connection
require('./app/models/db');

const authRoutes = require('./app/routes/authRoutes');
const bookRoutes = require('./app/routes/bookRoutes');

//iteration2
const progressRoutes = require('./app/routes/progressRoutes');
const goalRoutes     = require('./app/routes/goalRoutes');


// test route
app.get('/', (req, res) => {
    res.send('Backend is working');
});

app.use('/auth', authRoutes);
app.use('/books', bookRoutes);
//iteration2
app.use('/progress', progressRoutes);
app.use('/goals',    goalRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});