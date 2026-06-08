const sql = require('../models/db');
exports.getAnalytics = async (req, res) => {
    const { userID } = req.params;

    try {
        const booksResult = await sql.query`
            SELECT * FROM Books WHERE UserID = ${userID}
        `;
        const books = booksResult.recordset;

        const progressResult = await sql.query`
            SELECT rp.BookID, rp.PagesRead, rp.LoggedAt
            FROM ReadingProgress rp
            INNER JOIN Books b ON rp.BookID = b.BookID
            WHERE b.UserID = ${userID}
            ORDER BY rp.LoggedAt DESC
        `;
        const progressLogs = progressResult.recordset;
        const finished=books.filter(b => b.Status === 'Finished').length;
        const reading=books.filter(b => b.Status === 'Currently Reading').length;
        const wantToRead=books.filter(b => b.Status === 'Want to Read').length;
        const didNotFinish=books.filter(b => b.Status === 'Did Not Finish').length;
        const totalPages=books.reduce((sum, b) => sum + (b.TotalPages || 0), 0);
        const latestByBook={};
        progressLogs.forEach(log => {
            if (!latestByBook[log.BookID]) {
                latestByBook[log.BookID] = log.PagesRead; 
            }
        });
        const totalPagesRead = Object.values(latestByBook).reduce((a, b) => a + b, 0);
        const ratedBooks = books.filter(b => b.Rating != null && b.Rating > 0);
        const avgRating = ratedBooks.length
            ? (ratedBooks.reduce((sum, b) => sum + b.Rating, 0) / ratedBooks.length).toFixed(1)
            : null;
        const genreMap = {};
        books.forEach(b => {
            if (b.Genre && b.Genre !== 'Unknown') {
                genreMap[b.Genre] = (genreMap[b.Genre] || 0) + 1;
            }
        });
        const genreBreakdown = Object.entries(genreMap)
            .sort((a, b) => b[1] - a[1])
            .map(([genre, count]) => ({ genre, count }));
        const favoriteGenre = genreBreakdown[0]?.genre || null;
        const authorMap = {};
        books.forEach(b => {
            if (b.Author && b.Author !== 'Unknown') {
                authorMap[b.Author] = (authorMap[b.Author] || 0) + 1;
            }
        });
        const topAuthor = Object.entries(authorMap)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
        const avgPagesPerSession = progressLogs.length
            ? Math.round(progressLogs.reduce((sum, l) => sum + l.PagesRead, 0) / progressLogs.length)
            : 0;
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear  = now.getFullYear();
        let finishedThisMonth = 0;
        Object.entries(latestByBook).forEach(([bookID, pages]) => {
            const book = books.find(b => b.BookID === Number(bookID));
            if (book && book.Status === 'Finished') {
                const log = progressLogs.find(l => l.BookID === Number(bookID));
                if (log) {
                    const logDate = new Date(log.LoggedAt);
                    if (logDate.getMonth() === thisMonth && logDate.getFullYear() === thisYear) {
                        finishedThisMonth++;
                    }
                }
            }
        });
        const uniqueDays = [...new Set(
            progressLogs.map(l => new Date(l.LoggedAt).toDateString())
        )];

        let streak = 0;
        const today = new Date();
        for (let i = 0; i < uniqueDays.length; i++) {
            const expected = new Date(today);
            expected.setDate(today.getDate() - i);
            if (uniqueDays[i] === expected.toDateString()) {
                streak++;
            } else {
                break; 
            }
        }

        res.json({
            totalBooks:books.length,finished,
            currentlyReading:reading,
            wantToRead,
            didNotFinish,
            totalPages,
            totalPagesRead,
            avgRating:avgRating ? Number(avgRating) : null,
            favoriteGenre,
            topAuthor,
            genreBreakdown,
            avgPagesPerSession,
            finishedThisMonth,
            readingStreak:streak,
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
