const sql = require('../Models/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
function generateToken(user) {
    return jwt.sign(
        { userID: user.UserID, username: user.Username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

// POST /auth/register
exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}
    if (!username || !email || !password)
        return res.status(400).json({ message: 'All fields are required' });

    try {
        const hashed = await bcrypt.hash(password, 10);
        await sql.query`
            INSERT INTO Users (Username, Email, Password)
            VALUES (${username}, ${email}, ${hashed})
        `;
        const result = await sql.query`SELECT * FROM Users WHERE Email = ${email}`;
        const user = result.recordset[0];
        const token = generateToken(user);

        res.status(201).json({
            message: 'User registered successfully',
            token,  
            user: {
                userID: user.UserID,
                username: user.Username,
                email: user.Email
            }
        });
    } catch (err) {
        if (err.number === 2627)
            return res.status(400).json({ message: 'Username or email already exists' });
        res.status(500).json({ message: err.message });
    }
};

// POST /auth/login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ message: 'Email and password are required' });

    try {
        const result = await sql.query`SELECT * FROM Users WHERE Email = ${email}`;
        const user = result.recordset[0];

        if (!user)
            return res.status(401).json({ message: 'Invalid email or password' });

        const match = await bcrypt.compare(password, user.Password);
        if (!match)
            return res.status(401).json({ message: 'Invalid email or password' });

        const token = generateToken(user);

        res.json({
            message: 'Login successful',
            token,           
            user: {
                userID: user.UserID,
                username: user.Username,
                email: user.Email
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};