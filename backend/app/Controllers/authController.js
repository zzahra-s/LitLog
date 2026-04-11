const sql = require('../models/db');
const bcrypt = require('bcrypt');//to hash password

// post /auth/register
exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password)//400=bad req
        return res.status(400).json({ message: 'All fields are required' });

    try {
        const hashed = await bcrypt.hash(password, 10);//10 salt rounds used
        await sql.query` 
            INSERT INTO Users (Username, Email, Password)
            VALUES (${username}, ${email}, ${hashed})  
        `;
        res.status(201).json({ message: 'User registered successfully' });//201=created successfuly
    } catch (err) {
        if (err.number === 2627)//unique constraint violated
            return res.status(400).json({ message: 'Username or email already exists' });
        res.status(500).json({ message: err.message });//500=server error
    }
};

// post /auth/login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ message: 'Email and password are required' });

    try {
        const result = await sql.query`
            SELECT * FROM Users WHERE Email = ${email}
        `;
        const user = result.recordset[0];

        if (!user)
            return res.status(401).json({ message: 'Invalid email or password' });//401=unauthorized

        const match = await bcrypt.compare(password, user.Password);
        if (!match)
            return res.status(401).json({ message: 'Invalid email or password' });

        res.json({
            message: 'Login successful',
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