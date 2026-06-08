const express = require('express');
const router  = express.Router();
const analyticsController = require('../Controllers/analyticsController');
router.get('/:userID', analyticsController.getAnalytics);

module.exports = router;