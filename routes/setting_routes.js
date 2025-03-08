const express = require('express');
const { login, logoutUser,signupUser, getAllUser } = require('../controllers/user_controller');
const router = express.Router();


router.post('/login',login)
router.get('/logout',logoutUser)
router.post('/signup',signupUser)
router.get('/users',getAllUser)



module.exports = router;
