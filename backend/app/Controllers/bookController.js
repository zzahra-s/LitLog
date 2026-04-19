const sql = require('../Models/db');

//post/books
exports.addBook = async (req, res) => {
    const { userID, title, author, genre, totalPages, yearPublished, status } = req.body;

    if (!userID || !title)
        return res.status(400).json({ message: 'UserID and Title are required' });

    try {
        await sql.query`
            INSERT INTO Books (UserID, Title, Author, Genre, TotalPages, YearPublished, Status)
            VALUES (${userID}, ${title}, ${author}, ${genre}, ${totalPages}, ${yearPublished}, ${status})
        `;
        res.status(201).json({ message: 'Book added successfully' });//201 → created
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//get/books/:userID
exports.getBooks = async (req, res) => {
    const { userID } = req.params;

    try {
        const result = await sql.query`
            SELECT * FROM Books WHERE UserID = ${userID} ORDER BY AddedAt DESC
        `;
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//put/books/:id
exports.updateBook = async (req, res) => {
    const { id } = req.params;
    const { title, author, genre, totalPages, yearPublished, status, rating, notes } = req.body;

    try {
        await sql.query`
            UPDATE Books
            SET Title = ${title},
                Author = ${author},
                Genre = ${genre},
                TotalPages = ${totalPages},
                YearPublished = ${yearPublished},
                Status = ${status},
                Rating = ${rating},
                Notes = ${notes}
            WHERE BookID = ${id}
        `;
        res.json({ message: 'Book updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//delete/books/:id
exports.deleteBook = async (req, res) => {
    const { id } = req.params;

    try {
        await sql.query`
            DELETE FROM Books WHERE BookID = ${id}
        `;
        res.json({ message: 'Book deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//get/books/search?q=abc
exports.searchBooks = async (req, res) => {
    const { q, userID } = req.query;

    if (!q || !userID)
        return res.status(400).json({ message: 'Query and userID are required' });

    try {
        const searchTerm = `%${q}%`;
        const result = await sql.query`
            SELECT * FROM Books
            WHERE UserID = ${userID}
            AND (Title LIKE ${searchTerm} OR Author LIKE ${searchTerm} OR Genre LIKE ${searchTerm})
            ORDER BY AddedAt DESC 
        `;
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//get genre=/books/filter?genre=Fiction status=/books/filter?status=Finished
exports.filterBooks = async (req, res) => {
    const { genre, status, userID } = req.query;

    if (!userID)
        return res.status(400).json({ message: 'userID is required' });

    try {
        let result;
        if (genre) {
            result = await sql.query`
                SELECT * FROM Books WHERE UserID = ${userID} AND Genre = ${genre} ORDER BY AddedAt DESC
            `;
        } else if (status) {
            result = await sql.query`
                SELECT * FROM Books WHERE UserID = ${userID} AND Status = ${status} ORDER BY AddedAt DESC
            `;
        } else {
            return res.status(400).json({ message: 'Provide genre or status to filter' });
        }
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//Iteration2
// PATCH /books/:id/shelf
exports.updateShelf = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status)
        return res.status(400).json({ message: 'Status is required' });

    try {
        await sql.query`
            UPDATE Books SET Status = ${status} WHERE BookID = ${id}
        `;
        res.json({ message: 'Shelf updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PATCH /books/:id/rating
exports.updateRating = async (req, res) => {
    const { id } = req.params;
    const { rating, notes} = req.body;

    try {
        await sql.query`
            UPDATE Books
            SET Rating = ${rating}, Notes = ${notes}
            WHERE BookID = ${id}
        `;
        res.json({ message: 'Rating and notes saved' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};