const express = require("express")
const router = express.Router()
const { body, validationResult } = require("express-validator")
const { ensureAdmin } = require("../../middlewares/adminAuth")
const {
    productValidationRules,
    categoryValidationRules,
} = require("../../utils/validation")
const {
    getProducts,
    addProduct,
    getSingleProduct,
    editProduct,
    updateProduct,
    createNewProduct,
    deleteProduct,
    deleteImage,
    getCategories,
    editCategory,
    addCategory,
    addNewCategory,
    updateCategory,
    deleteCategory,
    addBrand,
    editBrand,
    getBrands,
    getSales,
    getSaleDetails,
    deleteOrder,
    updateOrder,
    cancelItem,
    shipItem,
    refundItem,
    getAddCoupon,
    postAddCoupon,
    getAllCoupons,
    deleteCoupon,
    getProductDiscount,
    getCategoryDiscount,
    getProductDiscountList,
    getCategoryDiscountList,
    addProductDiscount,
    addCategoryDiscount,
    deleteCategoryOffer,
    getSalesReport,
    getHome,
    getChartData,
    deleteProductOffer,
} = require("../../controller/admin/productController")

const validateRequest = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    next()
}

// Product Routes
router.get("/products", ensureAdmin, getProducts)
router.get("/addproduct", ensureAdmin, addProduct)
router.get("/product/:id", ensureAdmin, getSingleProduct)
router.get("/editproduct/:id", ensureAdmin, editProduct)
router.post("/editproduct/delete-image", ensureAdmin, deleteImage)
router.post(
    "/addproduct",
    ensureAdmin,
    // productValidationRules(),
    validateRequest,
    createNewProduct
)
router.post(
    "/editproduct",
    ensureAdmin,
    productValidationRules(),
    validateRequest,
    updateProduct
)
router.delete("/deleteproduct/:id", ensureAdmin, deleteProduct)

// Category Routes
router.get("/categories", ensureAdmin, getCategories)
router.get("/editcategory/:id", ensureAdmin, editCategory)
router.get("/addcategory", ensureAdmin, addCategory)
router.post(
    "/addcategory",
    ensureAdmin,
    categoryValidationRules(),
    validateRequest,
    addNewCategory
)
router.post(
    "/editcategory/:id",
    ensureAdmin,
    categoryValidationRules(),
    validateRequest,
    updateCategory
)
router.delete("/deletecategory/:id", ensureAdmin, deleteCategory)

// Brand Routes
router.get("/brands", ensureAdmin, getBrands)
router.get("/editbrand", ensureAdmin, editBrand)
router.get("/addbrand", ensureAdmin, addBrand)

// Order/Sales Routes
router.get("/sales", ensureAdmin, getSales)
router.get("/sales/saledetails/:id", ensureAdmin, getSaleDetails)
router.get("/orders/delete/:id", ensureAdmin, deleteOrder)
router.get("/sales/update", ensureAdmin, updateOrder)
router.get("/sales/cancelItem/:id", ensureAdmin, cancelItem)
router.get("/sales/refund/:id", ensureAdmin, refundItem)
router.get("/sales/shipItem/:id", ensureAdmin, shipItem)
router.get("/salesreport", ensureAdmin, getSalesReport)

// Coupon Routes
router.get("/add-coupon", ensureAdmin, getAddCoupon)
router.post(
    "/add-coupon",
    ensureAdmin,
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
    validateRequest,
    postAddCoupon
)
router.get("/coupons", ensureAdmin, getAllCoupons)
router.delete("/deletecoupon/:id", ensureAdmin, deleteCoupon)

// Discount Routes
router.get("/addproduct-discount", ensureAdmin, getProductDiscount)
router.get("/addcategory-discount", ensureAdmin, getCategoryDiscount)
router.get("/addproduct-discount-list", ensureAdmin, getProductDiscountList)
router.get("/addcategory-discount-list", ensureAdmin, getCategoryDiscountList)
router.post(
    "/addproduct-discount",
    ensureAdmin,
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
    validateRequest,
    addProductDiscount
)
router.post(
    "/addcategory-discount",
    ensureAdmin,
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
    validateRequest,
    addCategoryDiscount
)
router.delete("/delete-category-offer/:id", ensureAdmin, deleteCategoryOffer)
router.delete("/delete-product-offer/:id", ensureAdmin, deleteProductOffer)



// Dashboard Routes
router.get("/home", ensureAdmin, getHome)
router.get("/chart-data", ensureAdmin, getChartData)

module.exports = router
