const express = require("express")
// const collection = require("../controller/adminSchema")
// const userCollection = require("../../controller/schema")
const router = express.Router()
const authentication = require("../../controller/authentication")
const {
    getUsers,
    editUser,
    addUser,
    updateUserStatus,
} = require("../../controller/admin/userController")





router.get("/users", getUsers)
router.get("/newuser", addUser)
router.get("/edituser", editUser)
router.put("/updateUserStatus/:userId",updateUserStatus)

module.exports = router
