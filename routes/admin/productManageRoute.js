const express = require("express")
// const collection = require("../controller/adminSchema")
// const userCollection = require("../../controller/schema")

const router = express.Router()
const authentication = require("../../controller/authentication")
const { body, validationResult } = require("express-validator")
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
    updateProduct,
    getSaleDetails,
    getSales,
    deleteOrder,
    updateOrder,
    getAddCoupon,
    postAddCoupon,
    getAllCoupons,
    getProductDiscount,
    getCategoryDiscount,
    getProductDiscountList,
    getCategoryDiscountList,
    addProductDiscount,
    addCategoryDiscount,
    getSalesReport,
    cancelItem,
    refundItem,
    shipItem,
    deleteImage,
} = require("../../controller/admin/productController")



router.get("/products", getProducts)

router.get("/addproduct", addProduct)
router.get("/product/:id", getSingleProduct)    
router.get("/editproduct/:id", editProduct)
router.post("/editproduct/delete-image", deleteImage)
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
router.post('/editproduct',updateProduct)
router.get('/sales',getSales)
router.get('/sales/saledetails/:id',getSaleDetails)
router.get("/orders/delete/:id", deleteOrder)
router.get("/sales/update", updateOrder)
router.get('/add-coupon',getAddCoupon)
router.post(
    "/add-coupon",
    [
        body("coupon_code")
            .matches(/^[A-Z0-9]{6,}$/)
            .withMessage("Invalid coupon code format."),
        body("offer_percentage")
            .isInt({ min: 0, max: 100 })
            .withMessage("Offer percentage must be between 0 and 100."),
        body("start_date")
            .isISO8601()
            .withMessage("Invalid start date format."),
        body("end_date").isISO8601().withMessage("Invalid end date format."),
        body("coupon_description")
            .not()
            .isEmpty()
            .withMessage("Coupon description is required."),
    ],
    postAddCoupon
)
router.get('/coupons',getAllCoupons)
router.get('/addproduct-discount',getProductDiscount)
router.get("/addcategory-discount", getCategoryDiscount)
router.get("/addproduct-discount-list", getProductDiscountList)
router.get("/addcategory-discount-list", getCategoryDiscountList)
router.post(
    "/addproduct-discount",
    [ 
        body("offer_percentage")
            .isInt({ min: 0, max: 100 })
            .withMessage("Offer percentage must be between 0 and 100."),
        body("start_date")
            .isISO8601()
            .withMessage("Invalid start date format."),
        body("end_date").isISO8601().withMessage("Invalid end date format."),
        body("offer_description")
            .not()
            .isEmpty()
            .withMessage("Offer description is required."),
    ],
    addProductDiscount
)
router.post(
    "/addcategory-discount",
    [
        body("offer_percentage")
            .isInt({ min: 0, max: 100 })
            .withMessage("Offer percentage must be between 0 and 100."),
        body("start_date")
            .isISO8601()
            .withMessage("Invalid start date format."),
        body("end_date").isISO8601().withMessage("Invalid end date format."),
        body("offer_description")
            .not()
            .isEmpty()
            .withMessage("Offer description is required."),
    ],
    addCategoryDiscount
)
router.get("/salesreport",getSalesReport)
router.get("/sales/cancelItem/:id", cancelItem)
router.get("/sales/refund/:id",refundItem)
router.get("/sales/shipItem/:id", shipItem)

module.exports = router
