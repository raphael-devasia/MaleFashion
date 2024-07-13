// utils/cartUtils.js

const Wishlist = require("../models/wishlist")
const {cartProducts} = require("../utils/database") // Adjust the path as needed
const {findUserByEmail} = require("../utils/database") // Adjust the path as needed
const User = require("../models/schema")

// Function to calculate total cart amount
const calculateTotalCartAmount = (cart) => {
    const today = new Date()
    let totalAmount = 0

    cart.forEach((product) => {
        let discountPercentage = 0
        const productOfferValid =
            product.Product_Offers &&
            new Date(product.Product_Offers.start_date) <= today &&
            new Date(product.Product_Offers.end_date) >= today
        const categoryOfferValid =
            product.Product_Category_offers &&
            new Date(product.Product_Category_offers.start_date) <= today &&
            new Date(product.Product_Category_offers.end_date) >= today

        if (productOfferValid && categoryOfferValid) {
            discountPercentage = Math.max(
                product.Product_Offers.offer_percentage,
                product.Product_Category_offers.offer_percentage
            )
        } else if (productOfferValid) {
            discountPercentage = product.Product_Offers.offer_percentage
        } else if (categoryOfferValid) {
            discountPercentage =
                product.Product_Category_offers.offer_percentage
        }

        const discountAmount =
            (product.Product.Original_price * discountPercentage) / 100
        const effectivePrice = product.Product.Original_price - discountAmount

        totalAmount += effectivePrice * product.Qty
    })

    return totalAmount
}

// Function to get cart length
const getCartLength = async (sessionUser) => {
    let cartLength = 0
    const userCartTemp = await cartProducts()

    const userCart = userCartTemp.filter((e) => {
        if (e.User_details) {
            return e.User_details.email === sessionUser
        }
    })

    if (userCart.length > 0) {
        cartLength = userCart.length
    }

    return cartLength
}


const getWishlistLength = async (sessionUser) => {
     let wishListlength = 0
     if(!sessionUser){
        return wishListlength
     }
     const userId = await User.findOne({email:sessionUser})
     const wishListTemp = await Wishlist.find({ User_id: userId._id})
     if(wishListTemp.length>0){
        wishListlength = wishListTemp.length
     }
return wishListlength
}



// Function to get cart details (length and total amount)
const getCartDetails = async (sessionUser) => {
    const userCartTemp = await cartProducts()
    const userCart = userCartTemp.filter((e) => {
        if (e.User_details) {
            return e.User_details.email === sessionUser
        }
    })

    const cartLength = userCart.length
    const totalCartAmount = calculateTotalCartAmount(userCart)

    return { cartLength, totalCartAmount }
}

module.exports = {
    calculateTotalCartAmount,
    getCartLength,
    getCartDetails,
    getWishlistLength,
}
