const sql  = require('../models/db');
const axios = require('axios');

// GET /recommendations/:userID
exports.getRecommendations = async (req, res) => {
    const { userID } = req.params;

    try {
        //  Get user's books (with rating + time)
        const booksResult = await sql.query`
            SELECT Title, Genre, Author, Rating, AddedAt 
            FROM Books 
            WHERE UserID = ${userID}
        `;
        const books = booksResult.recordset;

        if (books.length === 0) {
            return res.json({
                recommendations: [],
                reason: 'Add books to get personalized recommendations'
            });
        }

        const now = new Date();
        const genreScore  = {};
        const authorScore = {};

        books.forEach(b => {
            const rating = b.Rating || 3;
            const daysOld = (now - new Date(b.AddedAt)) / (1000 * 60 * 60 * 24);
            const recencyWeight = 1 / (1 + daysOld);
            const score = rating * recencyWeight;

            if (b.Genre && b.Genre !== 'Unknown') {
                genreScore[b.Genre] = (genreScore[b.Genre] || 0) + score;
            }
            if (b.Author && b.Author !== 'Unknown') {
                authorScore[b.Author] = (authorScore[b.Author] || 0) + score;
            }
        });
        const topGenres = Object.entries(genreScore)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(g => g[0]);

        const topAuthors = Object.entries(authorScore)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(a => a[0]);

        const existingTitles = new Set(books.map(b => b.Title.toLowerCase()));
        const recommendations = [];

        async function fetchFromGoogle(query, reason, weight) {
            try {
                const response = await axios.get(
                    'https://www.googleapis.com/books/v1/volumes',
                    { params: { q: query, maxResults: 5, orderBy: 'relevance' } }
                );
                const items = response.data.items || [];
                items.forEach(item => {
                    const info  = item.volumeInfo;
                    const title = info.title || 'Unknown';

                    if (existingTitles.has(title.toLowerCase())) return;
                    if (recommendations.find(r => r.title.toLowerCase() === title.toLowerCase())) return;

                    recommendations.push({
                        id:            item.id,
                        title,
                        author:        info.authors?.join(', ') || 'Unknown',
                        genre:         info.categories?.[0]    || 'Unknown',
                        cover:         info.imageLinks?.thumbnail || null,
                        description:   info.description        || null,
                        totalPages:    info.pageCount          || 0,
                        yearPublished: info.publishedDate?.slice(0, 4) || 'N/A',
                        rating:        info.averageRating      || 0,
                        score:         weight,
                        reason,
                    });
                });
            } catch (err) { }
        }

        for (const genre of topGenres) {
            await fetchFromGoogle(`subject:${genre}`, `Because you like ${genre}`, 0.4);
        }

        for (const author of topAuthors) {
            await fetchFromGoogle(`inauthor:"${author}"`, `More from ${author}`, 0.3);
        }

        for (const b of books.slice(0, 3)) {
            await fetchFromGoogle(`intitle:${b.Title}`, `Because you liked ${b.Title}`, 0.5);
        }

        if (topGenres.length > 0) {
           
            const genreConditions = topGenres
                .map(g => `Genre = '${g.replace(/'/g, "''")}'`) 
                .join(' OR ');

            const similarUsersResult = await sql.query(
                `SELECT TOP 5 UserID
                 FROM Books
                 WHERE (${genreConditions})
                   AND UserID != ${Number(userID)}
                 GROUP BY UserID
                 ORDER BY COUNT(*) DESC`
            );

            const similarUsers = similarUsersResult.recordset.map(u => u.UserID);

            if (similarUsers.length > 0) {
                const userList = similarUsers.map(Number).join(',');
                const collabBooks = await sql.query(
                    `SELECT TOP 10 Title FROM Books WHERE UserID IN (${userList})`
                );
                for (const b of collabBooks.recordset) {
                    await fetchFromGoogle(
                        `intitle:${b.Title}`,
                        'Popular among similar readers',
                        0.6
                    );
                }
            }
        }

        if (recommendations.length === 0) {
            await fetchFromGoogle('bestseller books', 'Popular picks', 0.2);
        }
        recommendations.sort((a, b) => (b.score + b.rating) - (a.score + a.rating));

        res.json({
            recommendations: recommendations.slice(0, 10),
            basedOn: {
                topGenres,                    
                topAuthors,                   
                strategy: 'Hybrid (content + collaborative + recency + rating)',
            },
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
