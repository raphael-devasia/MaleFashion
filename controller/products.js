const mongoose = require("mongoose")
const { ObjectId } = mongoose.Types
const collection = require("../models/schema")
const GoogleUser = require("../models/googleUser")
const Product_category = require("../models/productSchema")
const ProductImage = require("../models/productImage")
const Shopping_cart = require("../models/shopping_cart")
const Shopping_cart_item = require("../models/shopping_cart_item")
const Payment_type = require("../models/payment_type")
const Shop_order = require("../models/shop_order")
const Order_status = require("../models/order_status")
const User_payment_method = require("../models/payment_method")
const Order_line = require("../models/order_line")
const Razorpay = require("razorpay")
const dotenv = require("dotenv")
const crypto = require("crypto")
const Coupon = require('../models/coupons')
const Address = require("../models/addresses")
const User_address = require("../models/userAddress")


dotenv.config()

const {
    fetchProductVariations,
    fetchAllProducts,
    findUserByEmail,
    cartProducts,
    getTotalAmount,
    getTotalAmountFromSession,
    getProductsFromSession,
    fetchSingleProduct,
} = require("../utils/database")
const {
    calculateTotalCartAmount,
    getCartLength,
    getCartDetails,
} = require("../utils/userProductsFunctions")
const { render } = require("ejs")
const Product_image = require("../models/productImage")
const Product_variation = require("../models/productVariation")
const Product_item = require("../models/product_item")
const Wishlist = require("../models/wishlist")
var instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})

require("../middlewares/auth")


const getHome = async (req, res) => {
    
    try {

 const { cartLength, totalCartAmount } = await getCartDetails(req.session.user)

        let category = await Product_category.find()
        // Check if there is a session user
        const productVariation = await ProductImage.aggregate([
            {
                $lookup: {
                    from: "product_variations",
                    localField: "Product_variation_id",
                    foreignField: "_id",
                    as: "Product_variation",
                },
            },
            { $unwind: "$Product_variation" },
            {
                $lookup: {
                    from: "product_items",
                    localField: "Product_variation.Product_item_id",
                    foreignField: "_id",
                    as: "Product_item",
                },
            },
            { $unwind: "$Product_item" },
            {
                $lookup: {
                    from: "products",
                    localField: "Product_item.Product_id",
                    foreignField: "_id",
                    as: "Product",
                },
            },
            { $unwind: "$Product" },
            {
                $group: {
                    _id: "$Product.product_name",
                    Original_price: { $first: "$Product_item.Original_price" },

                    Product_variation_ids: { $first: "$_id" },
                    images: { $push: "$Image_filename" },
                },
            },
        ])
        if (!req.session.user) {
          
            return res.render("user/index", {
                category,
                products: productVariation,
                name: null, // Assuming name is not available when there's no session user
                cartLength,
            })
        }

        // If there is a session user, proceed with fetching user data
        let user
        // Check if the user is in the local collection
        user = await collection.findOne({ email: req.session.user })

        // If user is not found in local collection, check GoogleUser collection
        if (!user) {
            user = await GoogleUser.findOne({ email: req.session.user })
        }

        category = await Product_category.find()
        

        const name = user.firstName
        return res.render("user/index", {
            category,
            products: productVariation,
            name,
            cartLength,
            totalCartAmount,
        })
    } catch (error) {
        console.log(error)
    }
}

//========>>>>>> ###### GET : http://localhost:5050/products ######
const getProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1 // Default to page 1 if not provided
  const limit = parseInt(req.query.limit) || 5 // Default to 5 products per page if not provided
  const skip = (page - 1) * limit
console.log(page, limit, skip)
    try {
         const { cartLength, totalCartAmount } = await getCartDetails(
             req.session.user
         )
       
        const category = await Product_category.find()

        const productVariation = await fetchProductVariations()

        function countCategories(products) {
            const categoryCount = {}

            products.forEach((product) => {
                const category = product.category
                if (categoryCount[category]) {
                    categoryCount[category]++
                } else {
                    categoryCount[category] = 1
                }
            })

            return categoryCount
        }
        console.log("VARIATION1", productVariation)
        // Using the function
        const categoryCount = countCategories(productVariation)
        const categoryArray = Object.keys(categoryCount).map((key) => ({
            key,
            count: categoryCount[key],
        }))

        console.log("VARIATION2", categoryArray)
        let productsToDisplay

        // Calculate the effective price for each product
        const today = new Date()

        productsToDisplay = productVariation.map((product) => {
            let discountPercentage = 0
            const productOfferValid =
                product.Offer_price &&
                new Date(product.Offer_price.start_date) <= today &&
                new Date(product.Offer_price.end_date) >= today
            const categoryOfferValid =
                product.category_offer &&
                new Date(product.category_offer.start_date) <= today &&
                new Date(product.category_offer.end_date) >= today

            if (productOfferValid && categoryOfferValid) {
                discountPercentage = Math.max(
                    product.Offer_price.offer_percentage,
                    product.category_offer.offer_percentage
                )
            } else if (productOfferValid) {
                discountPercentage = product.Offer_price.offer_percentage
            } else if (categoryOfferValid) {
                discountPercentage = product.category_offer.offer_percentage
            }

            const discountAmount =
                (product.Original_price * discountPercentage) / 100
            const effectivePrice = product.Original_price - discountAmount

            return {
                ...product,
                effectivePrice: discountPercentage
                    ? effectivePrice.toFixed(2)
                    : product.Original_price,
                discountPercentage,
            }
        })
        const user = await findUserByEmail(req.session.user)
        let name
        if (user) {
            name = user.firstName
        }
        const length = productsToDisplay.length
        // Apply pagination
        const paginatedProducts = productsToDisplay.slice(skip, skip + limit)
        const totalProducts = productsToDisplay.length
        const totalPages = Math.ceil(totalProducts / limit)
        // Calculate the current range of products being shown
        const start = skip + 1
        const end = Math.min(skip + limit, totalProducts)
        console.log("VARIATION3", totalProducts)
        res.render("user/shop", {
            data: paginatedProducts,
            category,
            categoryArray,
            page,
            totalPages,
            limit,
            length,
            start,
            end,
            name,
            cartLength,
            totalCartAmount,
        })
    } catch (error) {
        console.error(error)
        res.status(500).send("Internal Server Error")
    }
}
//========>>>>>> ###### GET : http://localhost:5050/products ######QUERY FILTERD
const getProductsFiltered = async (req, res) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 5
    const skip = (page - 1) * limit
    let selectedCategory = req.query.key
    const sortOption = req.query.sort || "price-asc"
      const searchQuery = req.query.search || ''    

    console.log("selectedCategory", selectedCategory)
    if (!selectedCategory){
        selectedCategory ='all'
    }
        try {
            const category = await Product_category.find()
            const productVariation = await fetchProductVariations()

            function countCategories(products) {
                const categoryCount = {}
                products.forEach((product) => {
                    const category = product.category
                    if (categoryCount[category]) {
                        categoryCount[category]++
                    } else {
                        categoryCount[category] = 1
                    }
                })
                return categoryCount
            }

            const categoryCount = countCategories(productVariation)
            const categoryArray = Object.keys(categoryCount).map((key) => ({
                key,
                count: categoryCount[key],
            }))

            let productsToDisplay
            if (selectedCategory) {
                if (selectedCategory == "all") {
                    productsToDisplay = productVariation
                } else {
                    productsToDisplay = productVariation.filter((e) => {
                        return e.category === selectedCategory
                    })
                }
            } else {
                productsToDisplay = productVariation.filter((e) => {
                    return e.category === categoryArray[0].key
                })
            }
             if (searchQuery) {
                 productsToDisplay = productsToDisplay.filter(
                     (product) =>
                         product._id &&
                         product._id
                             .toLowerCase()
                             .includes(searchQuery.toLowerCase())
                 )
             }

            const today = new Date()
            productsToDisplay = productsToDisplay.map((product) => {
                let discountPercentage = 0
                const productOfferValid =
                    product.Offer_price &&
                    new Date(product.Offer_price.start_date) <= today &&
                    new Date(product.Offer_price.end_date) >= today
                const categoryOfferValid =
                    product.category_offer &&
                    new Date(product.category_offer.start_date) <= today &&
                    new Date(product.category_offer.end_date) >= today

                if (productOfferValid && categoryOfferValid) {
                    discountPercentage = Math.max(
                        product.Offer_price.offer_percentage,
                        product.category_offer.offer_percentage
                    )
                } else if (productOfferValid) {
                    discountPercentage = product.Offer_price.offer_percentage
                } else if (categoryOfferValid) {
                    discountPercentage = product.category_offer.offer_percentage
                }

                const discountAmount =
                    (product.Original_price * discountPercentage) / 100
                const effectivePrice = product.Original_price - discountAmount

                return {
                    ...product,
                    effectivePrice: discountPercentage
                        ? effectivePrice.toFixed(2)
                        : product.Original_price,
                    discountPercentage,
                }
            })

                 productsToDisplay.sort((a, b) => {
                     if (sortOption === "price-asc") {
                         return a.effectivePrice - b.effectivePrice
                     } else if (sortOption === "price-desc") {
                         return b.effectivePrice - a.effectivePrice
                     } else if (sortOption === "name-asc") {
                         return (a._id || "").localeCompare(b._id || "")
                     } else if (sortOption === "name-desc") {
                         return (b._id || "").localeCompare(a._id || "")
                     }
                     return 0
                 })

            const totalProducts = productsToDisplay.length
            const totalPages = Math.ceil(totalProducts / limit)
            const paginatedProducts = productsToDisplay.slice(
                skip,
                skip + limit
            )
            console.log(
                skip + 1,
                Math.min(skip + limit, totalProducts),
                totalProducts
            )
            res.json({
                data: paginatedProducts,
                category,
                categoryArray,
                page,
                totalPages,
                limit,
                totalProducts,
                start: skip + 1,
                end: Math.min(skip + limit, totalProducts),
            })
        } catch (error) {
            console.error(error)
            res.status(500).send("Internal Server Error")
        }
}

//  ========>>>> GET (Single Product)  http://localhost:5050/products/:productId 
const singleProduct = async (req, res) => {
   
    const productId = req.params.id
    const colourId = req.query.color
    const sizeId = req.query.size || null
   

    try {
         const { cartLength, totalCartAmount } = await getCartDetails(
             req.session.user
         )
         const category = await Product_category.find()
        const getNew = await fetchAllProducts()
        const getSingleProduct = getNew.filter((e) => {
            console.log(
                `Comparing: '${e.Product.product_name.trim()}' with '${productId.trim()}'`
            )
            return (
                e.Product.product_name
                    .trim()
                    .localeCompare(productId.trim(), undefined, {
                        sensitivity: "base",
                    }) === 0
            )
        })

       

      
        const productImages = getSingleProduct.Image_filename

        const uniqueColors = new Set()

        getSingleProduct.forEach((product) => {
            const color = product.Colours?.Colour_name

            if (color) {
                uniqueColors.add(color)
            }
        })

        let filteredProduct
        const uniqueColorsArray = Array.from(uniqueColors).sort()

        if (colourId) {
            filteredProduct = getSingleProduct.filter((product) => {
                return product.Colours.Colour_name === colourId
            })
        } else {
            filteredProduct = getSingleProduct.filter((product) => {
                return product.Colours.Colour_name === uniqueColorsArray[0]
            })
        }

        const extractSizes = (products) => {
            const sizesArray = []

            products.forEach((product) => {
                const sizeName = product.Sizes.Size_name
                const sortOrder = product.Sizes.Sort_order

                if (!sizesArray.find((size) => size.size === sizeName)) {
                    sizesArray.push({
                        size: sizeName,
                        sortOrder: parseInt(sortOrder),
                    })
                }
            })

            // Sort sizesArray by sortOrder
            sizesArray.sort((a, b) => a.sortOrder - b.sortOrder)

            return sizesArray
        }
        // Usage example
        const sizesArray = extractSizes(filteredProduct)
        
        if (sizeId) {
            filteredProduct = filteredProduct.filter((product) => {
                return product.Sizes.Size_name === sizeId
            })
        } else {
            filteredProduct = filteredProduct.filter((product) => {
                return product.Sizes.Size_name === sizesArray[0].size
            })
        }
    const user = await findUserByEmail(req.session.user)
    let name
    if (user) {
        name = user.firstName
    }  
const today = new Date()

filteredProduct = filteredProduct.map((product) => {
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
        discountPercentage = product.Product_Category_offers.offer_percentage
    }

    const discountAmount =
        (product.Product_item.Original_price * discountPercentage) / 100
    const effectivePrice = product.Product_item.Original_price - discountAmount

    return {
        ...product,
        effectivePrice: discountPercentage
            ? effectivePrice
            : product.Product_item.Original_price,
        discountPercentage,
    }
})

  

        res.render("user/shopDetails", {
            getSingleProduct,
            filteredProduct,
            productImages,
            uniqueColorsArray,
            sizesArray,
            sizeId,
            category,
            name,
            cartLength,
            totalCartAmount,
        })
    } catch (error) {
        console.log(error)
    }
}
//  ========>>>> POST (Add To Cart)  http://localhost:5050/addtocart
const getAddToCart = async (req, res) => {
    const {
        product_id: Product_item_id,
        quantity: Qty,
        product_image,
        
    } = req.query // Destructuring query parameters
    const user = req.session.user
let wishlist = await Wishlist.findOne({ Product_image_id: product_image })

if (wishlist) {
    await Wishlist.findByIdAndDelete(wishlist._id)
}
      
    try {
        if (user) {
            // If user is logged in, find user details
            const userdetails = await findUserByEmail(user) // Assuming findUserByEmail is a function to find user details
            if (!userdetails) {
                throw new Error("User details not found") // Handle case where user details are not found
            }
            /// Find out product existing Cart
            const existingCart = await Shopping_cart_item.findOne({
                Product_item_id: product_image,
            })

            const productVariation = await fetchSingleProduct(product_image)
            const stockAvailable =
                productVariation.Product_variation_id.Qty_in_stock
           
            if (existingCart) {
               
                if (existingCart.Qty + parseInt(Qty) <= stockAvailable) {
                    const cartItemUpdation =
                        await Shopping_cart_item.findByIdAndUpdate(
                            existingCart._id,
                            { $inc: { Qty: Qty } },
                            { new: true }
                        )

                   
                    const usercartTemp = await cartProducts()

                    const userCart = usercartTemp.filter((e) => {
                        if (e.User_details) {
                            return e.User_details.email === user
                        }
                    })
              // const cartLength = await (await Shopping_cart_item.find()).length
                    const cartLength = userCart.length

                    return res.status(200).json({
                        message: "Item added to cart successfully",
                        cartLength,
                    })
                } else {
                    console.log(typeof stockAvailable)
                    console.log(typeof +Qty)
                    return res.status(400).json({
                        error: `You can Add only ${
                            stockAvailable - +existingCart.Qty
                        } Items `,
                    })
                }
            }

            // Create a new shopping cart for the user
            const newCart = await Shopping_cart.create({
                User_id: userdetails._id,
            })

            // Add item to the shopping cart
            const cartItem = await Shopping_cart_item.create({
                Product_item_id: product_image,
                Cart_id: newCart._id,
                Qty,
            })

            const usercartTemp = await cartProducts()

            const userCart = usercartTemp.filter((e) => {
                if (e.User_details) {
                    return e.User_details.email === user
                }
            })
           

            // const cartLength = await (await Shopping_cart_item.find()).length
            const cartLength = userCart.length
            const Cart_id = cartItem._id

            res.status(200).json({
                message: "Item added to cart successfully",
                cartLength,
            })
        } else {
            let cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : []
            const cartLength = cart.length
            cart.push({ Product_item_id, Qty, product_image })
            res.cookie("cart", JSON.stringify(cart), {
                httpOnly: true,
                path: "/",
            })
            const qtyToReduceNum = Number(Qty)
            // Reduce the item from the cart ===>
            const productReduce = await Product_image.findById(
                product_image
            ).populate({
                path: "Product_variation_id",
                model: "Product_variation",
            })
            if (productReduce) {
                const variationId = productReduce.Product_variation_id._id // Adjust according to your data structure

                await Product_variation.findByIdAndUpdate(variationId, {
                    $inc: { Qty_in_stock: -qtyToReduceNum },
                })

                console.log("Product quantity reduced successfully.")
            } else {
                console.log("Product not found.")
            }

            // Return a success response
            res.status(200).json({
                message: "Item added to cart successfully",
                cartLength,
            })
        }
    } catch (error) {
        console.error("Error adding item to cart:", error)
        res.status(500).json({ error: "Internal server error" }) // Return an error response
    }
}
//  ========>>>> GET (Cart)  http://localhost:5050/cart

const getCart = async (req, res) => {
    const stockUnavailability = req.query.cartId
    const stock = req.query.stock


    try {
        let category = await Product_category.find()
        const user = req.session.user
        let cartProduct = []
        
        let userdetails
        let newTotalAmount = 0
        let discountAmount = 0
        let couponCode = ""
      
 const { cartLength } = await getCartDetails(req.session.user)
        if (user) {
            // If user is logged in, retrieve cart from database
            userdetails = await findUserByEmail(user) // Assuming findUserByEmail is a function to find user details
            if (!userdetails) {
                throw new Error("User details not found")
            }

            const usercartTemp = await cartProducts()

            const userCart = usercartTemp.filter(
                (e) => e.User_details && e.User_details.email === user
            )
            console.log("FINAL USERCART TEMP", usercartTemp)
            if (stockUnavailability) {
                const updateQuantity =
                    await Shopping_cart_item.findByIdAndUpdate(
                        stockUnavailability,
                        { $set: { Qty: stock } }
                    )
            }

            if (userCart.length > 0) {
                cartProduct = userCart
                totalCartAmount = await getTotalAmount(userdetails._id)

                ///////Testin

                const today = new Date()

                cartProduct = userCart.map((product) => {
                    let discountPercentage = 0
                    const productOfferValid =
                        product.Product_Offers &&
                        new Date(product.Product_Offers.start_date) <= today &&
                        new Date(product.Product_Offers.end_date) >= today
                    const categoryOfferValid =
                        product.Product_Category_offers &&
                        new Date(product.Product_Category_offers.start_date) <=
                            today &&
                        new Date(product.Product_Category_offers.end_date) >=
                            today

                    if (productOfferValid && categoryOfferValid) {
                        discountPercentage = Math.max(
                            product.Product_Offers.offer_percentage,
                            product.Product_Category_offers.offer_percentage
                        )
                    } else if (productOfferValid) {
                        discountPercentage =
                            product.Product_Offers.offer_percentage
                    } else if (categoryOfferValid) {
                        discountPercentage =
                            product.Product_Category_offers.offer_percentage
                    }

                    const discountAmount =
                        (product.Product.Original_price * discountPercentage) /
                        100
                    const effectivePrice =
                        product.Product.Original_price - discountAmount

                    return {
                        ...product,
                        discountAmount,
                        effectivePrice: discountPercentage
                            ? effectivePrice
                            : product.Product.Original_price,
                        discountPercentage,
                    }
                })

                var totalOfferDiscount = cartProduct.reduce(
                    (total, product) =>
                        total + product.discountAmount * product.Qty,
                    0
                )
                console.log(totalOfferDiscount)
                ////testing ends

                couponCode = userdetails.coupon
                if (couponCode) {
                    const coupon = await Coupon.findOne({
                        coupon_code: couponCode,
                    })
                    if (coupon) {
                        discountAmount =
                            (coupon.offer_percentage / 100) * totalCartAmount
                        newTotalAmount = totalCartAmount - discountAmount
                    } else {
                        discountAmount = 0
                        newTotalAmount = totalCartAmount
                    }
                } else {
                    newTotalAmount = totalCartAmount
                }
            }
        } else {
            // If user is not logged in, retrieve cart from cookies
            let cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : []
            cartProduct = await getProductsFromSession(cart)
            totalCartAmount = await getTotalAmountFromSession(cart)

            return res.render("user/shopping-cart", {
                cartProduct,
                totalCartAmount: totalCartAmount.toFixed(2),
                discountAmount: discountAmount.toFixed(2),
                newTotalAmount: totalCartAmount.toFixed(2),
                user: false,
            })
        }
        const name = userdetails.firstName
        console.log("CART PRODUCT NEW : ", cartProduct)
        res.render("user/shopping-cart", {
            totalOfferDiscount: totalOfferDiscount,
            cartProduct,
            totalCartAmount: totalCartAmount.toFixed(2),
            discountAmount: discountAmount.toFixed(2),
            newTotalAmount: newTotalAmount.toFixed(2),
            couponCode,
            userdetails,
            user: true,
            category,
            name,
            cartLength,
        })
    } catch (error) {
        console.error("Error fetching cart:", error)
        res.status(500).json({ error: "Internal server error" })
    }
}


const deleteCart = async (req, res) => {
    const productId = req.query.product_id
    const product_image = req.query.Product_Img
    const Qty = req.query.Qty

    const user = req.session.user
    console.log("The PRODUCT ID IS", productId)
    if (user) {
        // If user is logged in, retrieve cart from database
        const userdetails = await findUserByEmail(user) // Assuming findUserByEmail is a function to find user details
        if (!userdetails) {
            throw new Error("User details not found")
        }

        const usercartTemp = await cartProducts()

        const userCart = usercartTemp.filter((e) => {
            if (e.User_details) {
                return e.User_details.email === user
            }
        })

        if (userCart) {
            // Find and delete the cart item
            await Shopping_cart_item.findByIdAndDelete(productId)
            // const CartAmount = await getTotalAmount()
            // const totalCartAmount = CartAmount[0].total

            totalCartAmount = await getTotalAmount(userdetails._id)

            const qtyToReduceNum = Number(Qty)

            // Reduce the item from the cart ===>

            console.log(qtyToReduceNum)

            await Product_variation.findByIdAndUpdate(product_image, {
                $inc: { Qty_in_stock: qtyToReduceNum },
            })

           
            return res.status(200).json({
                message: "Product removed from cart successfully",
                totalCartAmount,
            })
        } else {
            res.status(500).json({
                message: "Error removing product from cart",
                error: error.message,
            })
        }
    }
}


const getCheckout = async (req, res) => {
    let cartProduct = []
    let totalCartAmount = 0
    let discountAmount = 0
    let couponDiscountPercentage=0
     let couponCode = ""
    let newTotalAmount = 0
    const userSession = req.session.user
    const Payment_types = await Payment_type.find()
    const length = await getCartLength(userSession)
    if (!length || length<1){
        res.redirect('/home')
    }
        if (userSession) {
            const user = await findUserByEmail(userSession) // Assuming findUserByEmail is a function to find user details
            if (!user) {
                throw new Error("User details not found")
            }

            const userCartTemp = await cartProducts()

            const userCart = userCartTemp.filter(
                (e) => e.User_details && e.User_details.email === userSession
            )

            userCartTemp.forEach((product, i) => {
                if (product.Qty > product.Product_item.Qty_in_stock) {
                    index = i
                    cartId = product._id
                    stock = product.Product_item.Qty_in_stock
                    return res.redirect(`/cart?stock=${stock}&cartId=${cartId}`)
                }
            })

            if (userCart.length > 0) {
                cartProduct = userCart.filter(
                    (e) => e.Product_variation.Is_active
                )
                totalCartAmount = await getTotalAmount(user._id)

                const today = new Date()

                cartProduct = cartProduct.map((product) => {
                    let discountPercentage = 0
                    const productOfferValid =
                        product.Product_Offers &&
                        new Date(product.Product_Offers.start_date) <= today &&
                        new Date(product.Product_Offers.end_date) >= today
                    const categoryOfferValid =
                        product.Product_Category_offers &&
                        new Date(product.Product_Category_offers.start_date) <=
                            today &&
                        new Date(product.Product_Category_offers.end_date) >=
                            today

                    if (productOfferValid && categoryOfferValid) {
                        discountPercentage = Math.max(
                            product.Product_Offers.offer_percentage,
                            product.Product_Category_offers.offer_percentage
                        )
                    } else if (productOfferValid) {
                        discountPercentage =
                            product.Product_Offers.offer_percentage
                    } else if (categoryOfferValid) {
                        discountPercentage =
                            product.Product_Category_offers.offer_percentage
                    }

                    const discountAmount =
                        (product.Product.Original_price * discountPercentage) /
                        100
                    const effectivePrice =
                        product.Product.Original_price - discountAmount

                    return {
                        ...product,
                        discountAmount,
                        effectivePrice: discountPercentage
                            ? effectivePrice
                            : product.Product.Original_price,
                        discountPercentage,
                    }
                })

                const totalOfferDiscount = cartProduct.reduce(
                    (total, product) =>
                        total + product.discountAmount * product.Qty,
                    0
                )

                // Calculate newTotalAmount without coupon code
                newTotalAmount = cartProduct.reduce(
                    (total, product) =>
                        total + product.effectivePrice * product.Qty,
                    0
                )

                couponCode = user.coupon
                if (couponCode) {
                    const coupon = await Coupon.findOne({
                        coupon_code: couponCode,
                    })
                    if (coupon) {
                        const today = new Date()
                        const isValidCoupon =
                            new Date(coupon.start_date) <= today &&
                            new Date(coupon.end_date) >= today
                        if (isValidCoupon) {
                            couponDiscountPercentage = coupon.offer_percentage

                            discountAmount =
                                (coupon.offer_percentage / 100) *
                                totalCartAmount
                            newTotalAmount = newTotalAmount - discountAmount
                        }
                    }
                }

                const address = user.address_id.filter((a) => a.Is_Active)
                const shippingAddress = user.address_id.find(
                    (e) => e.Is_Shipping_default
                )
                const billingAddress = user.address_id.find(
                    (e) => e.Is_Billing_default
                )

                console.log(address)
                res.render("user/checkout", {
                    user,
                    totalOfferDiscount,
                    shippingAddress,
                    billingAddress,
                    cartProduct,
                    totalCartAmount,
                    address,
                    Payment_types,
                    couponDiscountPercentage:
                        couponDiscountPercentage.toFixed(2),
                    discountAmount: discountAmount.toFixed(2),
                    newTotalAmount: newTotalAmount.toFixed(2),
                    session: false,
                    couponCode,
                })
            } else {
                // User has no active cart items
                res.render("user/checkout", {
                    user,
                    couponCode,
                    shippingAddress: null,
                    billingAddress: null,
                    cartProduct: [],
                    totalCartAmount: 0,
                    address: [],
                    Payment_types,
                    discountAmount: discountAmount.toFixed(2),
                    newTotalAmount: newTotalAmount.toFixed(2),
                    session: false,
                    couponDiscountPercentage:
                        couponDiscountPercentage.toFixed(2),
                })
            }
        } else {
            // If user is not logged in, retrieve cart from cookies
            let cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : []
            totalCartAmount = await getTotalAmountFromSession(cart)
            cartProduct = await getProductsFromSession(cart)

            res.render("user/checkout", {
                cartProduct,
                totalCartAmount: totalCartAmount.toFixed(2),
                session: true,
                Payment_types,
                discountAmount: discountAmount.toFixed(2),
                newTotalAmount: newTotalAmount.toFixed(2),
            })
        }
}




const addCheckout = async (req, res) => {
    try {
        console.log(req.body)
        const {
            payment_method,
            couponDiscount,
            offerDiscount,
            total,
            subtotal,
            couponDiscountPercentage,

            billingFirstName,
            billingLastName,
            billingCountry,
            billingHouseNumber,
            billingAddressLine1,
            billingAddressLine2,
            billingState,
            billingPostalCode,

            shippingFirstName,
            shippingLastName,
            shippingCountry,
            shippingHouseNumber,
            shippingAddressLine1,
            shippingAddressLine2,
            shippingState,
            shippingPostalCode,
        } = req.body

        console.log("Step 1 Payment Method", payment_method)
        const userSession = req.session.user

        if (!userSession) {
            return res.status(401).json({ message: "User not authenticated" })
        }

        const userdetails = await findUserByEmail(userSession) // Assuming findUserByEmail is a function to find user details
        if (!userdetails) {
            throw new Error("User details not found")
        }

        const paymentDetails = await Payment_type.findOne({
            Value: payment_method,
        })
        console.log("Step 2 Payment Method", paymentDetails)

        const totalCartAmount = await getTotalAmount(userdetails._id)

        // Get default addresses for user
        const shippingAddress = userdetails.address_id.find(
            (e) => e.Is_Shipping_default
        )
        const billingAddress = userdetails.address_id.find(
            (e) => e.Is_Billing_default
        )

        console.log("SHIPPING:", shippingAddress)
        console.log("BILLING:", billingAddress)

        const usercartTemp = await cartProducts()
        const cartProduct = usercartTemp.filter(
            (e) => e.User_details?.email === userSession
        )
        const userCart = cartProduct.filter(
            (e) => e.Product_variation.Is_active
        )

        const couponCode = userdetails.coupon

        // Check for existing addresses
        const existingBillingAddress = await Address.findOne({
            FirstName: billingFirstName,
            LastName: billingLastName,
            House_number: billingHouseNumber,
            Address_line_1: billingAddressLine1,
            Address_line_2: billingAddressLine2,
            Postal_code: billingPostalCode,
            State: billingState,
            Country: billingCountry,
        })

        const existingShippingAddress = await Address.findOne({
            FirstName: shippingFirstName,
            LastName: shippingLastName,
            House_number: shippingHouseNumber,
            Address_line_1: shippingAddressLine1,
            Address_line_2: shippingAddressLine2,
            Postal_code: shippingPostalCode,
            State: shippingState,
            Country: shippingCountry,
        })

        let billingAddressId = existingBillingAddress
            ? existingBillingAddress._id
            : null
        let shippingAddressId = existingShippingAddress
            ? existingShippingAddress._id
            : null

        if (!existingBillingAddress) {
            const newBillingAddress = new Address({
                FirstName: billingFirstName,
                LastName: billingLastName,
                House_number: billingHouseNumber,
                Address_line_1: billingAddressLine1,
                Address_line_2: billingAddressLine2,
                Postal_code: billingPostalCode,
                State: billingState,
                Country: billingCountry,
            })

            await newBillingAddress.save()
            billingAddressId = newBillingAddress._id

           const userAddress=  await User_address.create({
                Is_Billing_default: true,
                Is_Shipping_default: false,
                Address_id: billingAddressId,
            })
             const user = await collection
                 .findOneAndUpdate(
                     { email: userSession },
                     { $push: { address_id: userAddress._id } },
                     { new: true }
                 )
                 .populate("address_id")
        }

        if (!existingShippingAddress) {
            const newShippingAddress = new Address({
                FirstName: shippingFirstName,
                LastName: shippingLastName,
                House_number: shippingHouseNumber,
                Address_line_1: shippingAddressLine1,
                Address_line_2: shippingAddressLine2,
                Postal_code: shippingPostalCode,
                State: shippingState,
                Country: shippingCountry,
            })

            await newShippingAddress.save()
            shippingAddressId = newShippingAddress._id

           const userAddress=  await User_address.create({
                Is_Billing_default: false,
                Is_Shipping_default: true,
                Address_id: shippingAddressId,
            })
             const user = await collection
                 .findOneAndUpdate(
                     { email: userSession },
                     { $push: { address_id: userAddress._id } },
                     { new: true }
                 )
                 .populate("address_id")
        } else if (billingAddressId === shippingAddressId) {
            // If the billing and shipping addresses are the same, update the User_address record accordingly
           const User_address = await User_address.findOneAndUpdate(
               { Address_id: billingAddressId },
               { Is_Shipping_default: true, Is_Billing_default: true }
           )
            
        }

        // Generate order number and create order status
        const orderNumber = await generateCombinedOrderNumber()
        const orderStatus = await Order_status.create({})

        // Create order details
        const orderDetail = await Shop_order.create({
            Order_number: orderNumber,
            User_id: userdetails._id,
            Payment_method_id: paymentDetails._id,
            Product_cost: subtotal,
            Coupon_discount: couponDiscount,
            Coupon_code: couponCode,
            Order_total: total,
            Order_status: orderStatus._id,
            Sales_discount: offerDiscount,
            Shipping_address: {
                FirstName: shippingFirstName,
                LastName: shippingLastName,
                House_number: shippingHouseNumber,
                Address_line_1: shippingAddressLine1,
                Address_line_2: shippingAddressLine2,
                Postal_code: shippingPostalCode,
                State: shippingState,
                Country: shippingCountry,
            },
            Billing_address: {
                FirstName: billingFirstName,
                LastName: billingLastName,
                House_number: billingHouseNumber,
                Address_line_1: billingAddressLine1,
                Address_line_2: billingAddressLine2,
                Postal_code: billingPostalCode,
                State: billingState,
                Country: billingCountry,
            },
        })

        // Create order lines
        const orderLine = await Order_line.create({
            Product_item_id: [],
            Price: [],
            Order_id: orderDetail._id,
            Product_name: [],
            Qty: [],
            Offer_percentage: [],
            Status: [],
            Coupon_percentage: [],
        })

        for (const e of userCart) {
            const update = {
                $push: {
                    Product_item_id: e.Product_item_id,
                    Product_name: e.SingleProduct.product_name,
                    Price: e.Product.Original_price,
                    Offer_percentage: e.Product_Category_offers
                        ? e.Product_Category_offers.offer_percentage
                        : 0,
                    Qty: e.Qty,
                    Status: "Processing",
                    Coupon_percentage: couponDiscountPercentage,
                },
            }

            await Order_line.findByIdAndUpdate(orderLine._id, update, {
                new: true,
            })

            const updatedOrderLine = await Order_line.findById(orderLine._id)
            console.log(updatedOrderLine)

            // Reduce the item from the stock
            const qtyToReduceNum = Number(e.Qty)

            const productReduce = await Product_image.findById(
                e.Product_item_id
            ).populate({
                path: "Product_variation_id",
                model: "Product_variation",
            })

            if (productReduce) {
                const variationId = productReduce.Product_variation_id._id

                await Product_variation.findByIdAndUpdate(variationId, {
                    $inc: { Qty_in_stock: -qtyToReduceNum },
                })

                console.log("Product quantity reduced successfully.")
                console.log("USER CART: ", e)
                const cartId = e.Cart_id
                console.log("CART ID: ", cartId)
                console.log("CART ITEM ID", e._id)
                await Shopping_cart_item.findByIdAndDelete(e._id)
                await Shopping_cart.findByIdAndDelete(cartId)
            } else {
                console.log("Product not found.")
            }
        }

        if (payment_method === "Credit Card") {
            try {
                const receipt = orderDetail._id.toString().replace(/\D/g, "")
                console.log(receipt)
                const amount = Math.round(total * 100)

                const razorDetails = await instance.orders.create({
                    amount: amount,
                    currency: "INR",
                    receipt: orderDetail._id,
                    notes: {
                        key1: "value3",
                        key2: "value2",
                    },
                })

                console.log(razorDetails)
                return res.status(200).json({
                    message: "Proceed to payment",
                    razorDetails: {
                        id: razorDetails.id,
                        amount: razorDetails.amount,
                        receipt: razorDetails.receipt,
                    },
                })
            } catch (error) {
                console.error(error)
                return res
                    .status(500)
                    .send({ message: "Internal Server Error" })
            }
        } else if (payment_method === "Cash On Delivery") {
            return res.status(200).json({
                message: "Order placed successfully",
                orderId: orderDetail._id,
            })
        } else {
            return res.status(400).send({ message: "Invalid payment method" })
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}


const updateCart = async (req, res) => {
    const cartUpdates = req.body
    console.log(cartUpdates)
    try {
        if (!Array.isArray(cartUpdates)) {
            return res.status(400).json({ message: "Invalid data format" })
        }

        // Loop through each update request and update the corresponding cart item
        const updatePromises = cartUpdates.map(async (update) => {
            const { id, quantity } = update
            if (!id || !quantity) {
                throw new Error("ID and quantity are required")
            }

            const updatedItem = await Shopping_cart_item.findByIdAndUpdate(
                id,
                {
                    $set: { Qty: quantity },
                },
                { new: true }
            )

            if (!updatedItem) {
                throw new Error(`Cart item with ID ${id} not found`)
            }

            return updatedItem
        })

        // Wait for all update promises to resolve
        await Promise.all(updatePromises)

        res.status(200).json({ message: "Cart updated successfull" })
    } catch (error) {
        console.error("Error updating cart:", error)
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        })
    }
}
// const updateCart = async(req,res)=>{

// const cartUpdates = req.body

// }
const verifyPayment = async (req, res) => {
    const { payment, order } = req.body
    let hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    hmac.update(payment.razorpay_order_id + "|" + payment.razorpay_payment_id)
    hmac = hmac.digest("hex")

    if (hmac == payment.razorpay_signature) {
        try {
            const orderDetails = await Shop_order.findById(order.receipt)
            const updateStatus = await Order_status.findByIdAndUpdate(
                orderDetails.Order_status,
                { $set: { Status: "Paid" } },
                { new: true }
            )

            return res.status(200).json({
                message: "Order placed successfully",
            })
        } catch (error) {
            return res.status(500).json({
                message: "Internal server error",
            })
        }
    } else {
        return res.status(400).json({
            message: "Invalid payment",
        })
    }
}

const getCatogoryProducts = async (req, res) => {
    const selectedCategory = req.params.id

    try {
        const category = await Product_category.find()

        const productVariation = await fetchProductVariations()

        function countCategories(products) {
            const categoryCount = {}

            products.forEach((product) => {
                const category = product.category
                if (categoryCount[category]) {
                    categoryCount[category]++
                } else {
                    categoryCount[category] = 1
                }
            })

            return categoryCount
        }

        // Using the function
        const categoryCount = countCategories(productVariation)
        const categoryArray = Object.keys(categoryCount).map((key) => ({
            key,
            count: categoryCount[key],
        }))

        let productsToDisplay
        if (selectedCategory) {
            console.log("categoryArray:", selectedCategory)
            productsToDisplay = productVariation.filter((e) => {
                return e.category === selectedCategory
            })
        } else {
            productsToDisplay = productVariation.filter((e) => {
                return e.category === categoryArray[0].key
            })
        }

        // Calculate the effective price for each product
        const today = new Date()

        productsToDisplay = productsToDisplay.map((product) => {
            let discountPercentage = 0
            const productOfferValid =
                product.Offer_price &&
                new Date(product.Offer_price.start_date) <= today &&
                new Date(product.Offer_price.end_date) >= today
            const categoryOfferValid =
                product.category_offer &&
                new Date(product.category_offer.start_date) <= today &&
                new Date(product.category_offer.end_date) >= today

            if (productOfferValid && categoryOfferValid) {
                discountPercentage = Math.max(
                    product.Offer_price.offer_percentage,
                    product.category_offer.offer_percentage
                )
            } else if (productOfferValid) {
                discountPercentage = product.Offer_price.offer_percentage
            } else if (categoryOfferValid) {
                discountPercentage = product.category_offer.offer_percentage
            }

            const discountAmount =
                (product.Original_price * discountPercentage) / 100
            const effectivePrice = product.Original_price - discountAmount

            return {
                ...product,
                effectivePrice: discountPercentage
                    ? effectivePrice
                    : product.Original_price,
                discountPercentage,
            }
        })

        console.log(productsToDisplay)

        res.render("user/categorypro", {
            data: productsToDisplay,
            category,
            categoryArray,
        })
    } catch (error) {
        console.error(error)
        res.status(500).send("Internal Server Error")
    }
}


const addToWishlist = async (req, res) => {
    try {
        const productId = req.query.product_id
        const user = req.session.user

        if (!user) {
            return res.status(401).json({ message: "User not logged in" })
        }

        const userdetails = await findUserByEmail(user)

        if (!userdetails) {
            return res.status(404).json({ message: "User not found" })
        }

        const existingWishList = await Wishlist.findOne({
            Product_image_id: productId,
            User_id: userdetails._id,
        })

        if (existingWishList) {
            return res
                .status(400)
                .json({ message: "Product exists in Wishlist" })
        }

        await Wishlist.create({
            Product_image_id: productId,
            User_id: userdetails._id,
        })

        const wishListAll = await Wishlist.find({ User_id: userdetails._id })
        const wishlistCount = wishListAll.length

        return res.status(200).json({
            message: "Product added to Wishlist",
            wishlistCount,
        })
    } catch (error) {
        console.error("Error adding product to wishlist:", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

const getWishlist = async (req, res) => {
    try {
        const category = await Product_category.find()

        const user = req.session.user

        if (!user) {
            return res.status(401).json({ message: "User not logged in" })
        }

        const userdetails = await findUserByEmail(user)

        if (!userdetails) {
            return res.status(404).json({ message: "User not found" })
        }

        const existingWishList = await Wishlist.find({
            User_id: userdetails._id,
        })

        if (existingWishList.length < 1) {
            return res.status(400).json({ message: "No Products In wishlist" })
        }

        const getNew = await fetchAllProducts()
        const wishListItems = []

        const productPromises = existingWishList.map(async (item) => {
            const product = await fetchSingleProduct(item.Product_image_id)
            const productName =
                product.Product_variation_id.Product_item_id.Product_id
                    .product_name

            const getSingleProduct = getNew.filter((e) => {
                return (
                    e.Product.product_name
                        .trim()
                        .localeCompare(productName.trim(), undefined, {
                            sensitivity: "base",
                        }) === 0
                )
            })

            // Find unique colors and their associated sizes
            const colorsWithSizes = extractColorsAndSizes(getSingleProduct)

            wishListItems.push({
                product,
                colorsWithSizes,
            })
        })

        await Promise.all(productPromises)
console.log("category");
        res.render("user/wishlist", { category, wishListItems })
    } catch (error) {
        console.error("Error getting wishlist:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

// Helper function to extract colors and their associated sizes
const extractColorsAndSizes = (products) => {
    const colorsWithSizes = {}

    products.forEach((product) => {
        const color = product.Colours?.Colour_name
        const sizeName = product.Sizes.Size_name
        const sortOrder = product.Sizes.Sort_order

        if (color) {
            if (!colorsWithSizes[color]) {
                colorsWithSizes[color] = []
            }
            if (
                !colorsWithSizes[color].find((size) => size.size === sizeName)
            ) {
                colorsWithSizes[color].push({
                    size: sizeName,
                    sortOrder: parseInt(sortOrder),
                })
            }
        }
    })

    // Sort sizes for each color
    Object.keys(colorsWithSizes).forEach((color) => {
        colorsWithSizes[color].sort((a, b) => a.sortOrder - b.sortOrder)
    })

    return colorsWithSizes
}
const verifyCoupon = async (req,res)=>{
    const { couponCode, userId } = req.body
    try {
        const coupon = await Coupon.findOne({ coupon_code: couponCode })
        if (!coupon) {
            return res.json({ valid: false, message: "Invalid coupon code" })
        }

        const currentDate = new Date()
        if (
            currentDate < new Date(coupon.start_date) ||
            currentDate > new Date(coupon.end_date)
        ) {
            return res.json({ valid: false, message: "Coupon is not active" })
        }

        const cart = await Shopping_cart.find({ User_id: userId })
        if (!cart.length>0) {
            return res
                .status(400)
                .json({ valid: false, message: "Invalid cart" })
        }
        const finduser = await collection.findById(userId)
       const totalCartAmount = await getTotalAmount(finduser._id)

        const discountAmount = (coupon.offer_percentage / 100) * totalCartAmount
        const newTotalAmount = totalCartAmount - discountAmount

        // Update the user's coupon field
        const user = await collection.findByIdAndUpdate(
            userId,
            {
                $set: { coupon: couponCode },
            },
            { new: true }
        )
        console.log("total cart Amount Test 1 ", user)

        res.json({ valid: true, discountAmount, newTotalAmount, user })
       
    } catch (error) {
        console.error(error)
        res.status(500).json({ valid: false, message: "Server error" })
    }
}
const removeWishlistItem = async (req, res) => {
    const product_id = req.query.product_id

    try {
        await Wishlist.findOneAndDelete({ Product_image_id: product_id })
        res.status(200).json({ msg: "success" })
    } catch (error) {
        res.status(500).json({ msg: "Error removing item from wishlist" })
    }
}
async function getLastOrderNumber() {
    const lastOrder = await Shop_order.findOne()
        .sort({ Order_number: -1 })
        .exec()
    if (lastOrder && lastOrder.Order_number) {
        const lastOrderNumber = lastOrder.Order_number.split("-")[1]
        return parseInt(lastOrderNumber, 10)
    }
    return 1000 // Default starting number if no orders exist
}

async function generateCombinedOrderNumber() {
    const lastOrderNumber = await getLastOrderNumber();
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `${datePart}-${lastOrderNumber + 1}`;
}


// router.get('/deletewishlist',deleteWishlist)

module.exports = {
    getHome,
    singleProduct,
    getProducts,
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
}
