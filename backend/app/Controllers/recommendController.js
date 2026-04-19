
const sql  = require('../Models/db');
const axios = require('axios'); 

// GET /recommendations/:userID
exports.getRecommendations = async (req, res) => {
    const { userID } = req.params;

    try {
        const booksResult = await sql.query`
            SELECT Genre, Author FROM Books WHERE UserID = ${userID}
        `;
        const books = booksResult.recordset;

        if (books.length === 0)
            return res.json({ recommendations: [], reason: 'Add some books first to get recommendations!' });
        const genreMap = {};
        books.forEach(b => {
            if (b.Genre && b.Genre !== 'Unknown')
                genreMap[b.Genre] = (genreMap[b.Genre] || 0) + 1;
        });
        const topGenre = Object.entries(genreMap).sort((a, b) => b[1] - a[1])[0]?.[0];
        const authorMap = {};
        books.forEach(b => {
            if (b.Author && b.Author !== 'Unknown')
                authorMap[b.Author] = (authorMap[b.Author] || 0) + 1;
        });
        const topAuthor = Object.entries(authorMap).sort((a, b) => b[1] - a[1])[0]?.[0];
        const existingTitlesResult = await sql.query`
            SELECT LOWER(Title) AS title FROM Books WHERE UserID = ${userID}
        `;
        const existingTitles = new Set(existingTitlesResult.recordset.map(r => r.title));
        const recommendations = [];
        async function fetchFromGoogle(query, label) {
            try {
                const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
                    params: { q: query, maxResults: 6, orderBy: 'relevance' }
                });

                const items = response.data.items || [];
                items.forEach(item => {
                    const info = item.volumeInfo;
                    const title = info.title || 'Unknown';
                    if (existingTitles.has(title.toLowerCase())) return;
                    if (recommendations.find(r => r.title.toLowerCase() === title.toLowerCase())) return;
                    recommendations.push({
                        id:            item.id,
                        title,
                        author:info.authors?.join(', ') || 'Unknown',
                        genre:info.categories?.[0]|| topGenre || 'Unknown',
                        cover:info.imageLinks?.thumbnail || null,
                        totalPages:info.pageCount || 0,
                        yearPublished: info.publishedDate?.split('-')[0] || 'N/A',
                        rating: info.averageRating|| 0,
                        description:info.description || null,
                        reason: label  
                    });
                });
            } catch {
            }
        }
        if (topGenre)  await fetchFromGoogle(`subject:${topGenre}`, `Because you love ${topGenre}`);
        if (topAuthor) await fetchFromGoogle(`inauthor:${topAuthor}`, `More by ${topAuthor}`);
        if (recommendations.length === 0) {
            await fetchFromGoogle('bestseller fiction', 'Popular picks for you');
        }

        res.json({
            recommendations: recommendations.slice(0, 10), 
            basedOn: { topGenre, topAuthor }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};