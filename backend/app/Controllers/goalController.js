const sql = require('../Models/db');

// POST /goals  — set a reading goal
exports.setGoal = async (req, res) => {
    const { userID, goalType, targetBooks, year, month } = req.body;

    if (!userID || !goalType || !targetBooks || !year)
        return res.status(400).json({ message: 'userID, goalType, targetBooks, and year are required' });

    try {
        await sql.query`
            INSERT INTO ReadingGoals (UserID, GoalType, TargetBooks, Year, Month)
            VALUES (${userID}, ${goalType}, ${targetBooks}, ${year}, ${month || null})
        `;
        res.status(201).json({ message: 'Goal set successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /goals/:userID  — get all goals for a user
exports.getGoals = async (req, res) => {
    const { userID } = req.params;

    try {
        const result = await sql.query`
            SELECT * FROM ReadingGoals WHERE UserID = ${userID} ORDER BY Year DESC
        `;
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /goals/:id  — update a goal's target
exports.updateGoal = async (req, res) => {
    const { id } = req.params;
    const { targetBooks } = req.body;

    try {
        await sql.query`
            UPDATE ReadingGoals SET TargetBooks = ${targetBooks} WHERE GoalID = ${id}
        `;
        res.json({ message: 'Goal updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};