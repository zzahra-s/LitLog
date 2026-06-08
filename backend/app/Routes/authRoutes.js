const express = require('express');
const router  = express.Router();
const authController = require('../controllers/authController');
const { body } = require('express-validator');

router.post('/register', [
body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isLength({ max: 100 })
    .withMessage('Email cannot exceed 100 characters')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
    body('password')
        .isLength({ min: 8 , max: 255})
        .withMessage('Password must be between 8 and 255 characters'),
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
], authController.register);

router.post('/login', authController.login);

module.exports = router;
