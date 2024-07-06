const express = require("express")
const router = express.Router()
const {
    checkUserStatus,
    isAuthenticatedUser,
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
} = require("../../controller/products")

router.use(checkUserStatus)

router.get("/home", getHome)
router.get("/products", getProducts)
router.get("/products/:id",singleProduct)

router.get("/addtocart",isAuthenticatedUser,getAddToCart)
router.get("/cart", isAuthenticatedUser,getCart)
router.get("/deleteproduct",isAuthenticatedUser,deleteCart)
router.get("/checkout",isAuthenticatedUser,getCheckout)
router.post("/checkout",isAuthenticatedUser,addCheckout)
router.post("/updateCart",isAuthenticatedUser,updateCart)
router.post('/verify-payment',isAuthenticatedUser,verifyPayment)
router.get("/category/:id",isAuthenticatedUser, getCatogoryProducts)
router.get("/addtowishlist",isAuthenticatedUser,addToWishlist)
router.get("/wishlist",isAuthenticatedUser,getWishlist)
router.post("/verify-coupon",isAuthenticatedUser,verifyCoupon)
router.get("/wishlist/remove-item",isAuthenticatedUser, removeWishlistItem)
router.get("/filtered-category", isAuthenticatedUser,getProductsFiltered)
// router.get('/deletewishlist',deleteWishlist)

module.exports = router