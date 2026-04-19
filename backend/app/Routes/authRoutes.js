const express = require('express');
const router  = express.Router();
const authController = require('../Controllers/authController');
const { body } = require('express-validator');
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('username').trim().notEmpty()
], authController.register);

router.post('/login',authController.login);

module.exports = router;