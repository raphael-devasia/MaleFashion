const express = require("express")
const router = express.Router()
const {
    checkUserStatus,
    isAuthenticatedUser,
    reDirectioAuth,
} = require("../../middlewares/userAuth")
const {
    getHome,
    getProducts,
    singleProduct,
    getAddToCart,
    getCart,
    deleteCart,
    getCheckout,
    addCheckout,
    updateCart,
    verifyPayment,
    getCatogoryProducts,
    addToWishlist,
    getWishlist,
    verifyCoupon,
    removeWishlistItem,
    getProductsFiltered,
    // deleteWishlist,
    deleteAllWishlist,
    paymentFailed,
    paymentRetry,
    aboutUs,
} = require("../../controller/products")

router.use(checkUserStatus)

router.get("/home", getHome)
router.get("/products", getProducts)
router.get("/products/:id",singleProduct)

router.get("/addtocart",isAuthenticatedUser,getAddToCart)
router.get("/cart", [reDirectioAuth,isAuthenticatedUser], getCart)
router.get("/deleteproduct",isAuthenticatedUser,deleteCart)
router.get("/checkout",isAuthenticatedUser,getCheckout)
router.post("/checkout",addCheckout)
router.post("/updateCart",isAuthenticatedUser,updateCart)
router.post('/verify-payment',verifyPayment)
router.get("/category/:id",isAuthenticatedUser, getCatogoryProducts)
router.get("/addtowishlist",isAuthenticatedUser,addToWishlist)
router.get("/wishlist",isAuthenticatedUser,getWishlist)
router.post("/verify-coupon",isAuthenticatedUser,verifyCoupon)
router.get("/wishlist/remove-item",isAuthenticatedUser, removeWishlistItem)
router.get("/filtered-category",getProductsFiltered)
router.get("/delete-all-wishlist",deleteAllWishlist)
router.get("/payment-failed",paymentFailed)
router.post('/payment-retry',paymentRetry)
router.get("/about", aboutUs)
// router.get('/deletewishlist',deleteWishlist)

module.exports = router