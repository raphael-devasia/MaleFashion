const express = require("express")
// const collection = require("../controller/adminSchema")
// const userCollection = require("../../controller/schema")

const router = express.Router()
const authentication = require("../../controller/authentication")
const { body, validationResult } = require("express-validator")
const { isAuthenticatedAdmin } = require("../../middlewares/userAuth")
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
    getHome,
    deleteCoupon,
    deleteCategoryOffer,
    getChartData,
} = require("../../controller/admin/productController")



router.get("/products",isAuthenticatedAdmin,  getProducts)

router.get("/addproduct",isAuthenticatedAdmin,  addProduct)
router.get("/product/:id",isAuthenticatedAdmin,  getSingleProduct)    
router.get("/editproduct/:id",isAuthenticatedAdmin,  editProduct)
router.post("/editproduct/delete-image",isAuthenticatedAdmin,  deleteImage)
router.get("/categories",isAuthenticatedAdmin,  getCategories)
router.get("/editcategory/:id",isAuthenticatedAdmin,  editCategory)
router.get("/addcategory",isAuthenticatedAdmin,  addCategory)
router.get("/brands",isAuthenticatedAdmin,  getBrands)
router.get("/editbrand",isAuthenticatedAdmin,  editBrand)
router.get("/addbrand",isAuthenticatedAdmin,  addBrand)
router.post("/addcategory",isAuthenticatedAdmin,  addNewCategory)
router.post("/editcategory/:id",isAuthenticatedAdmin,  updateCategory)
router.delete("/deletecategory/:id",isAuthenticatedAdmin,  deleteCategory)
router.delete("/deleteproduct/:id",isAuthenticatedAdmin, deleteProduct)
router.post("/addproduct",isAuthenticatedAdmin,  createNewProduct)
router.post('/editproduct',isAuthenticatedAdmin, updateProduct)
router.get('/sales',isAuthenticatedAdmin, getSales)
router.get('/sales/saledetails/:id',isAuthenticatedAdmin, getSaleDetails)
router.get("/orders/delete/:id",isAuthenticatedAdmin,  deleteOrder)
router.get("/sales/update",isAuthenticatedAdmin,  updateOrder)
router.get('/add-coupon',isAuthenticatedAdmin, getAddCoupon)
router.delete("/deletecoupon/:id",isAuthenticatedAdmin,  deleteCoupon)
router.delete("/delete-category-offer/:id",isAuthenticatedAdmin,  deleteCategoryOffer)
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
router.get('/coupons',isAuthenticatedAdmin, getAllCoupons)
router.get('/addproduct-discount',isAuthenticatedAdmin, getProductDiscount)
router.get("/addcategory-discount",isAuthenticatedAdmin,  getCategoryDiscount)
router.get("/addproduct-discount-list",isAuthenticatedAdmin,  getProductDiscountList)
router.get("/addcategory-discount-list", isAuthenticatedAdmin, getCategoryDiscountList)
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
router.get("/salesreport",isAuthenticatedAdmin, getSalesReport)
router.get("/sales/cancelItem/:id",isAuthenticatedAdmin,  cancelItem)
router.get("/sales/refund/:id",isAuthenticatedAdmin, refundItem)
router.get("/sales/shipItem/:id", isAuthenticatedAdmin, shipItem)
router.get("/home",isAuthenticatedAdmin,  getHome)
router.get("/chart-data",isAuthenticatedAdmin,  getChartData)

module.exports = router
