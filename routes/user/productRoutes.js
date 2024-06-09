const express = require("express")
const router = express.Router()

const {
    getHome,
    getProducts,
    singleProduct,
} = require("../../controller/products")


router.get("/home", getHome)
router.get("/products", getProducts)
router.get("/products/:id",singleProduct)

module.exports = router