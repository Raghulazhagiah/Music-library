const express = require('express');
const { login, addUser, deleteUser, logoutUser,signupUser, updatePassword } = require('../controllers/user_controller');
const router = express.Router();


router.post('/login',login)
router.delete('/user/:id', deleteUser)
router.post('/add-user',addUser)
router.get('/logout',logoutUser)
router.post('/signup',signupUser)
router.delete('/:id', deleteUser)
router.post('/update-password', updatePassword)


module.exports = router;
