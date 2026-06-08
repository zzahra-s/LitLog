const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');

router.post('/',          progressController.logProgress);
router.get('/:bookID',    progressController.getProgress);

module.exports = router;