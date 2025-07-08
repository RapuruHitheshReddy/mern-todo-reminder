const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');

// Register
router.post('/register', authController.register);

// Login (Passport Local Strategy)
router.post(
  '/login',
  passport.authenticate('local'),
  authController.login
);

// Logout
router.post('/logout', authController.logout);

// Check login status
router.get('/me', authController.getCurrentUser);

router.get('/debug-session', (req, res) => {
  res.json({
    session: req.session,
    user: req.user,
    authenticated: req.isAuthenticated(),
  });
});


module.exports = router;
