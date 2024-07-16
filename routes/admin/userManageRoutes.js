const express = require("express")
// const collection = require("../controller/adminSchema")
// const userCollection = require("../../controller/schema")
const router = express.Router()
const authentication = require("../../controller/authentication")
const {isAuthenticatedAdmin}= require("../../middlewares/userAuth")
const {
    getUsers,
    editUser,
    addUser,
    updateUserStatus,
} = require("../../controller/admin/userController")





router.get("/users",isAuthenticatedAdmin, getUsers)
router.get("/newuser",isAuthenticatedAdmin, addUser)
router.get("/edituser",isAuthenticatedAdmin, editUser)
router.put("/updateUserStatus/:userId", isAuthenticatedAdmin,updateUserStatus)

module.exports = router
