const sql = require('../Models/db');

// POST /progress  — log pages read for a book
exports.logProgress = async (req, res) => {
    const { bookID, pagesRead } = req.body;

    if (!bookID || pagesRead === undefined)
        return res.status(400).json({ message: 'bookID and pagesRead are required' });

    try {
        await sql.query`
            INSERT INTO ReadingProgress (BookID, PagesRead)
            VALUES (${bookID}, ${pagesRead})
        `;
        res.status(201).json({ message: 'Progress logged successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /progress/:bookID  — get latest progress for a book
exports.getProgress = async (req, res) => {
    const { bookID } = req.params;

    try {
        const result = await sql.query`
            SELECT TOP 1 PagesRead, LoggedAt
            FROM ReadingProgress
            WHERE BookID = ${bookID}
            ORDER BY LoggedAt DESC
        `;
        // If no progress logged yet, return 0
        const latest = result.recordset[0] || { PagesRead: 0 };
        res.json(latest);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};