const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

router.get('/search', bookController.searchBooks);
router.get('/filter', bookController.filterBooks);
router.post('/', bookController.addBook);
router.get('/:userID', bookController.getBooks);
router.put('/:id', bookController.updateBook);
router.delete('/:id', bookController.deleteBook);

// iteration 2
router.patch('/:id/shelf', bookController.updateShelf);
router.patch('/:id/rating', bookController.updateRating);

module.exports = router;