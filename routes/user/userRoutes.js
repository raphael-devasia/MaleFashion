const express = require("express")
const collection = require("../../models/schema")
const router = express.Router()
const passport = require("passport")
require("../../middlewares/auth")
const localvariables = require("../../middlewares/localvariable")
const { checkUserStatus, isAuthenticatedUser } = require ("../../middlewares/userAuth")

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

    userDetails,
    userUpdate,
    getAddress,
    newAddress,
    addNewAddress,
    deleteAddress,
    editAddress,
    updateAddress,
    setShipping,
    setBilling,
    getOrders,
    getOrderDetails,
    deleteOrder,
    getWallet,
    cancelItem,
    confirmDelivery,
    returnDelivery,
} = require("../../controller/user")

router.use(checkUserStatus)
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


// router.use(isAuthenticatedUser)

router.get('/user',isAuthenticatedUser,userDetails)
router.post("/user/updateprofile", isAuthenticatedUser,userUpdate)
router.get("/user/address",isAuthenticatedUser,getAddress)
router.get("/user/addnewaddress",isAuthenticatedUser, newAddress)
router.post("/user/addnewaddress",isAuthenticatedUser, addNewAddress)
router.put("/user/deleteaddres", isAuthenticatedUser,deleteAddress)
router.get("/user/updateaddress/:id",isAuthenticatedUser,editAddress)
router.post("/user/updateaddress", isAuthenticatedUser,updateAddress)
router.get("/user/setshipping/:id",isAuthenticatedUser,setShipping)
router.get("/user/setbilling/:id",isAuthenticatedUser,setBilling)
router.get("/user/orders",isAuthenticatedUser,getOrders)
router.get("/user/orders/orderdetail/:id", isAuthenticatedUser,getOrderDetails)
router.get("/user/orders/delete/:id",isAuthenticatedUser,deleteOrder)
router.get('/user/orders/delete-item/:id',isAuthenticatedUser,cancelItem)
router.get('/user/wallet',isAuthenticatedUser,getWallet)
router.get("/user/orders/confirm-delivery/:id",isAuthenticatedUser,confirmDelivery)
router.get("/user/orders/return-delivery/:id",isAuthenticatedUser,returnDelivery)




module.exports = router
