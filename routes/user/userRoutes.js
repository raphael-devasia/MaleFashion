const express = require("express")
const collection = require("../../models/schema")
const router = express.Router()
const passport = require("passport")
require("../../middlewares/auth")
const localvariables = require("../../middlewares/localvariable")

const {
    getLogin,
    getRegister,
    
    getLogout,
    createLogin,
    createRegister,
    
    forgotPassword,
    checkPassword,
    generateOTP,
    verifyOTP,
    registerMail,
    passwordOTP,
    passwordConfirm,
    newPassword,
    displayOTP,
    confirmPassword,
} = require("../../controller/user")


router.get("/login", getLogin)
router.post("/login", createLogin)

router.get("/register", getRegister)
router.post("/register", createRegister)
router.post("/register/generateOTP", localvariables, generateOTP)
router.post("/verify-otp", verifyOTP)
router.post("/password-otp",passwordConfirm)
router.post("/newpassword",newPassword)
// router.get("/register/verifyOTP", verifyOTP)




router.get("/forgot-password",forgotPassword)
router.post("/forgot-password",checkPassword)
router.post("/passwordOTP",passwordOTP)
router.get("/passwordOTP",displayOTP)

router.post('/registerMail',registerMail)
router.get('/passwordconfirmation',confirmPassword)

router.get("/logout", getLogout)
module.exports = router
