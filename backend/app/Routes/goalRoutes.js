const express = require('express');
const router = express.Router();
const goalController = require('../controllers/goalController');

router.post('/',         goalController.setGoal);
router.get('/:userID',   goalController.getGoals);
router.put('/:id',       goalController.updateGoal);

module.exports = router;