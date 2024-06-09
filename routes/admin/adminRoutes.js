const express = require("express")
// const collection = require("../controller/adminSchema")
// const userCollection = require("../../controller/schema")
const router = express.Router()
const authentication = require('../../controller/authentication')
const {
    getLogin,
    getRegister,
    getHome,
    getLogout,
    createLogin,
    createRegister,
 
    searchData,
  
} = require("../../controller/admin/signInController")




router.route("/login").get(getLogin).post(createLogin)
router.route("/register").get(getRegister).post(createRegister)


router.get("/home", getHome)
router.get("/logout", getLogout)

router.post("/search",searchData)



module.exports = router
