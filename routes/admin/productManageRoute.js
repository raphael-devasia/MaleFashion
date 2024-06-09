const express = require("express")
// const collection = require("../controller/adminSchema")
// const userCollection = require("../../controller/schema")

const router = express.Router()
const authentication = require("../../controller/authentication")
const {
    getProducts,
    addProduct,
    getSingleProduct,
    editProduct,
    getCategories,
    editCategory,
    addCategory,
    addBrand,
    editBrand,
    getBrands,
    addNewCategory,
    updateCategory,
    deleteCategory,
    createNewProduct,
    deleteProduct,
} = require("../../controller/admin/productController")



router.get("/products", getProducts)
router.get("/addproduct", addProduct)
router.get("/product", getSingleProduct)    
router.get("/editproduct", editProduct)
router.get("/categories", getCategories)
router.get("/editcategory/:id", editCategory)
router.get("/addcategory", addCategory)
router.get("/brands", getBrands)
router.get("/editbrand", editBrand)
router.get("/addbrand", addBrand)
router.post("/addcategory", addNewCategory)
router.post("/editcategory/:id", updateCategory)
router.delete("/deletecategory/:id", deleteCategory)
router.delete("/deleteproduct/:id",deleteProduct)
router.post("/addproduct", createNewProduct)

module.exports = router
