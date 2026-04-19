const express = require('express');
const router  = express.Router();
const recommendController = require('../Controllers/recommendController');

router.get('/:userID',recommendController.getRecommendations);

module.exports = router;