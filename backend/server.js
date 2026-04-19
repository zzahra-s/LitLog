const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app  = express();
const PORT = 5001;
app.use(express.json());
app.use(cors());
require('./app/Models/db');

// Routes
const authRoutes=require('./app/Routes/authRoutes');
const verifyToken = require('./app/Middleware/authMiddleware');
const bookRoutes= require('./app/Routes/bookRoutes');
const progressRoutes= require('./app/Routes/progressRoutes');
const goalRoutes= require('./app/Routes/goalRoutes');
const analyticsRoutes= require('./app/Routes/analyticsRoutes');     // iteration 3
const recommendRoutes= require('./app/Routes/recommendRoutes');     // iteration 3

app.use('/auth',authRoutes);
app.use(verifyToken);  
app.use('/books',bookRoutes);
app.use('/progress',progressRoutes);
app.use('/goals',goalRoutes);
app.use('/analytics',analyticsRoutes);       // iteration 3
app.use('/recommendations',recommendRoutes);       // iteration 3

app.get('/', (req, res) => res.send('Backend is working'));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

