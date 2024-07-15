// utils/database.js

const Product_category = require("../models/productSchema")
const ProductImage = require("../models/productImage")
const collection = require("../models/schema")
const Product_items = require('../models/product_item')
const GoogleUser = require("../models/googleUser")
const User_address = require("../models/userAddress")
const Address = require("../models/addresses")
const Shopping_cart_item = require("../models/shopping_cart_item")
const { model } = require("mongoose")
const Order_line = require ('../models/order_line')

const fetchCategories = async () => {
    return await Product_category.find()
}

const fetchProductVariations = async () => {
    return await ProductImage.aggregate([
        { $match: { Is_active: true } },
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
                from: "product_offers",
                localField: "Product_item.Offer_price_id",
                foreignField: "_id",
                as: "Product_Offers",
            },
        },
        {
            $unwind: {
                path: "$Product_Offers",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "colours",
                localField: "Product_item.Colour_id",
                foreignField: "_id",
                as: "Colours",
            },
        },
        { $unwind: "$Colours" },
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
            $lookup: {
                from: "productcategories",
                localField: "Product.product_category_id",
                foreignField: "_id",
                as: "Product_Category",
            },
        },
        { $unwind: "$Product_Category" },
        {
            $lookup: {
                from: "category_offers",
                localField: "Product_Category.Offer_price_id",
                foreignField: "_id",
                as: "Product_Category_offers",
            },
        },
        {
            $unwind: {
                path: "$Product_Category_offers",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $group: {
                _id: "$Product.product_name",
                Original_price: { $first: "$Product_item.Original_price" },
                Offer_price: { $first: "$Product_Offers" },
                Product_variation_ids: { $first: "$_id" },
                images: { $push: "$Image_filename" },
                category: { $first: "$Product_Category.category_name" },
                category_offer: { $first: "$Product_Category_offers" },
                colours: { $addToSet: "$Colours.Colour_name" },
            },
        },
    ])
}
const fetchAllProducts = async () => {
    return await ProductImage.aggregate([
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
                from: "product_offers",
                localField: "Product_item.Offer_price_id",
                foreignField: "_id",
                as: "Product_Offers",
            },
        },
        {
            $unwind: {
                path: "$Product_Offers",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "colours",
                localField: "Product_item.Colour_id",
                foreignField: "_id",
                as: "Colours",
            },
        },
        { $unwind: "$Colours" },
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
            $lookup: {
                from: "productcategories",
                localField: "Product.product_category_id",
                foreignField: "_id",
                as: "Product_Category",
            },
        },
        { $unwind: "$Product_Category" },
        {
            $lookup: {
                from: "category_offers",
                localField: "Product_Category.Offer_price_id",
                foreignField: "_id",
                as: "Product_Category_offers",
            },
        },
        {
            $unwind: {
                path: "$Product_Category_offers",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "size_categories",
                localField: "Product_Category.size_category",
                foreignField: "_id",
                as: "Size_category",
            },
        },
        { $unwind: "$Size_category" },
        {
            $lookup: {
                from: "sizeoptions",
                localField: "Product_variation.Size_id",
                foreignField: "_id",
                as: "Sizes",
            },
        },
        { $unwind: "$Sizes" },

        // {
        //     $group: {
        //         _id: "$Product.product_name",
        //         Original_price: { $first: "$Product_item.Original_price" },
        //         Product_variation_ids: { $first: "$_id" },
        //         images: { $push: "$Image_filename" },
        //         category: { $first: "$Product_Category.category_name" },
        //         colours: { $addToSet: "$Colours.Colour_name" },
        //     },
        // },
    ])
}

const fetchSingleProduct = async (productId) => {
    return await ProductImage.findById(productId).populate({
        path: "Product_variation_id",
        populate: [
            {
                path: "Product_item_id",
                model: "Product_item",
                populate: [
                    {
                        path: "Product_id",
                        model: "Product",
                        populate: {
                            path: "product_category_id",
                            model: "ProductCategory",
                        },
                    },
                    {
                        path: "Colour_id",
                        model: "Colour",
                    },
                ],
            },
            {
                path: "Size_id",
                model: "SizeOption",
            },
        ],
    })
}
const cartProducts = async () => {
    return await Shopping_cart_item.aggregate([
        {
            $lookup: {
                from: "product_images",
                localField: "Product_item_id",
                foreignField: "_id",
                as: "Product_variation",
            },
        },
        { $unwind: "$Product_variation" },
        {
            $lookup: {
                from: "product_variations",
                localField: "Product_variation.Product_variation_id",
                foreignField: "_id",
                as: "Product_item",
            },
        },
        { $unwind: "$Product_item" },

        {
            $lookup: {
                from: "product_items",
                localField: "Product_item.Product_item_id",
                foreignField: "_id",
                as: "Product",
            },
        },
        { $unwind: "$Product" },
        {
            $lookup: {
                from: "product_offers",
                localField: "Product.Offer_price_id",
                foreignField: "_id",
                as: "Product_Offers",
            },
        },
        {
            $unwind: {
                path: "$Product_Offers",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "products",
                localField: "Product.Product_id",
                foreignField: "_id",
                as: "ProductDetails",
            },
        },
        { $unwind: "$Product" },
        {
            $lookup: {
                from: "productcategories",
                localField: "ProductDetails.product_category_id",
                foreignField: "_id",
                as: "Product_Category",
            },
        },
        { $unwind: "$Product_Category" },
        {
            $lookup: {
                from: "category_offers",
                localField: "Product_Category.Offer_price_id",
                foreignField: "_id",
                as: "Product_Category_offers",
            },
        },
        {
            $unwind: {
                path: "$Product_Category_offers",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "products",
                localField: "Product.Product_id",
                foreignField: "_id",
                as: "SingleProduct",
            },
        },
        { $unwind: "$SingleProduct" },
        {
            $lookup: {
                from: "shopping_carts",
                localField: "Cart_id",
                foreignField: "_id",
                as: "Cart_details",
            },
        },
        {
            $unwind: {
                path: "$Cart_details",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "Cart_details.User_id",
                foreignField: "_id",
                as: "User_details",
            },
        },
        {
            $unwind: {
                path: "$User_details",
                preserveNullAndEmptyArrays: true,
            },
        },
    ])
}

const getTotalAmount = async (userId) => {
    let aggregationPipeline = [
        {
            $lookup: {
                from: "product_images",
                localField: "Product_item_id",
                foreignField: "_id",
                as: "Product_variation",
            },
        },
        { $unwind: "$Product_variation" },
        {
            $match: {
                "Product_variation.Is_active": true,
            },
        },
        {
            $lookup: {
                from: "product_variations",
                localField: "Product_variation.Product_variation_id",
                foreignField: "_id",
                as: "Product_item",
            },
        },
        { $unwind: "$Product_item" },
        {
            $lookup: {
                from: "product_items",
                localField: "Product_item.Product_item_id",
                foreignField: "_id",
                as: "Product",
            },
        },
        { $unwind: "$Product" },
        {
            $lookup: {
                from: "products",
                localField: "Product.Product_id",
                foreignField: "_id",
                as: "SingleProduct",
            },
        },
        { $unwind: "$SingleProduct" },
        {
            $group: {
                _id: null,
                total: {
                    $sum: {
                        $multiply: [
                            { $toDouble: "$Qty" },
                            { $toDouble: "$Product.Original_price" },
                        ],
                    },
                },
            },
        },
    ]

    // Add stages for user-specific filtering
    aggregationPipeline.unshift(
        {
            $lookup: {
                from: "shopping_carts",
                localField: "Cart_id",
                foreignField: "_id",
                as: "Cart_details",
            },
        },
        {
            $unwind: {
                path: "$Cart_details",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "Cart_details.User_id",
                foreignField: "_id",
                as: "User_details",
            },
        },
        {
            $unwind: {
                path: "$User_details",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $match: {
                "User_details._id": userId,
            },
        }
    )

    try {
        const result = await Shopping_cart_item.aggregate(aggregationPipeline)
        if (result.length > 0) {
            return result[0].total
        } else {
            return 0 // Return 0 if no matching items found
        }
    } catch (error) {
        console.error("Error calculating total amount:", error)
        throw new Error("Error calculating total amount")
    }
}




const findUserByEmail = async (email) => {
    let user = await collection.findOne({ email: email }).populate({
        path: "address_id",
        model: "User_address",
        populate: {
            path: "Address_id",
        },
    })
    if (!user) {
        user = await GoogleUser.findOne({ email: email }).populate({
            path: "address_id",
            model: "User_address",
            populate: {
                path: "Address_id",
            },
        })
    }

    return user
}

const getTotalAmountFromSession = async (sessionData) => {
    let totalAmount = 0

    // Loop through each item in session data
    for (const item of sessionData) {
        const { Product_item_id, Qty } = item

        // Fetch product details (assuming you have a function to retrieve product price)
        const product = await Product_items.findById(Product_item_id) // Implement getProductById function

        if (product) {
           
            const price = product.Original_price // Replace with actual price field

            // Calculate subtotal for this item
            const subtotal = parseFloat(price) * parseInt(Qty)

            // Add subtotal to total amount
            totalAmount += subtotal
        } else {
            console.warn(`Product not found for id: ${Product_item_id}`)
        }
    }

    return totalAmount
}


const getProductsFromSession = async (sessionData) => {
    let products = []

    // Loop through each item in session data
    for (const item of sessionData) {
        const { product_image, Qty } = item

        // Fetch product details
        const product = await fetchSingleProduct(product_image) // Assuming product_image is the ID

        if (product) {
            products.push({ product, Qty })
        } else {
            console.warn(`Product not found for id: ${product_image}`)
        }
    }

    return products
}
// For the admin Dashboard

const getOrderLines = async()=>{
   
const orderLines = await Order_line.aggregate([
    {
        $lookup: {
            from: "shop_orders", // The collection name for Order
            localField: "Order_id",
            foreignField: "_id",
            as: "orderDetails",
        },
    },
    {
        $unwind: "$orderDetails",
    },
    {
        $lookup: {
            from: "order_statuses", // The collection name for Order_status
            localField: "orderDetails.Order_status",
            foreignField: "_id",
            as: "orderStatusDetails",
        },
    },
    {
        $unwind: "$orderStatusDetails",
    },
    {
        $addFields: {
            combined: {
                $zip: {
                    inputs: [
                        "$Product_name",
                        "$Qty",
                        "$Price",
                        "$Offer_percentage",
                        "$Coupon_percentage",
                        "$Status",
                        "$Product_item_id",
                    ],
                },
            },
        },
    },
    {
        $unwind: "$combined",
    },
    {
        $match: { "combined.5": "Delivered" },
    },
    {
        $group: {
            _id: { $arrayElemAt: ["$combined", 0] },
            Product_item_id: {
                $first: { $arrayElemAt: ["$combined", 6] },
            },
            totalQty: { $sum: { $arrayElemAt: ["$combined", 1] } },

            totalPrice: {
                $sum: {
                    $multiply: [
                        {
                            $subtract: [
                                {
                                    $subtract: [
                                        {
                                            $arrayElemAt: ["$combined", 2],
                                        },
                                        {
                                            $divide: [
                                                {
                                                    $multiply: [
                                                        {
                                                            $arrayElemAt: [
                                                                "$combined",
                                                                2,
                                                            ],
                                                        },
                                                        {
                                                            $arrayElemAt: [
                                                                "$combined",
                                                                3,
                                                            ],
                                                        },
                                                    ],
                                                },
                                                100,
                                            ],
                                        },
                                    ],
                                },
                                {
                                    $divide: [
                                        {
                                            $multiply: [
                                                {
                                                    $subtract: [
                                                        {
                                                            $arrayElemAt: [
                                                                "$combined",
                                                                2,
                                                            ],
                                                        },
                                                        {
                                                            $divide: [
                                                                {
                                                                    $multiply: [
                                                                        {
                                                                            $arrayElemAt:
                                                                                [
                                                                                    "$combined",
                                                                                    2,
                                                                                ],
                                                                        },
                                                                        {
                                                                            $arrayElemAt:
                                                                                [
                                                                                    "$combined",
                                                                                    3,
                                                                                ],
                                                                        },
                                                                    ],
                                                                },
                                                                100,
                                                            ],
                                                        },
                                                    ],
                                                },
                                                {
                                                    $arrayElemAt: [
                                                        "$combined",
                                                        4,
                                                    ],
                                                },
                                            ],
                                        },
                                        100,
                                    ],
                                },
                            ],
                        },
                        { $arrayElemAt: ["$combined", 1] },
                    ],
                },
            },
            orderStatusDetails: { $first: "$orderStatusDetails" }, // Add this line
        },
    },
    {
        $sort: { totalQty: -1 }, // Add this stage to sort by totalQty in descending order
    },
])
return orderLines
}
 




module.exports = {
    fetchCategories,
    fetchProductVariations,
    fetchSingleProduct,
    findUserByEmail,
    fetchAllProducts,
    cartProducts,
    getTotalAmount,
    getTotalAmountFromSession,
    getProductsFromSession,
    getOrderLines,
}
