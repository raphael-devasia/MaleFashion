const collection = require("../models/schema")
const GoogleUser = require("../models/googleUser")
const Product_category = require("../models/productSchema")
const ProductImage = require("../models/productImage")

require("../middlewares/auth")

//========>>>>>> ###### GET : http://localhost:5050/home ######

const getHome = async (req, res) => {
    try {
        // Check if there is a session user
        if (!req.session.user) {
            // If no session user, redirect to the home page with default data
            const category = await Product_category.find()
            const productVariation = await ProductImage.find().populate({
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

            // Render the home page with default data
            return res.render("user/index", {
                data: category,
                products: productVariation,
                name: null, // Assuming name is not available when there's no session user
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

        const category = await Product_category.find()
        const productVariation = await ProductImage.find().populate({
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

        const name = user.firstName
        return res.render("user/index", {
            data: category,
            products: productVariation,
            name,
        })
    } catch (error) {
        console.log(error)
      
    }
}

//========>>>>>> ###### GET : http://localhost:5050/products ######

const getProducts = async (req, res) => {
    try {
        const category = await Product_category.find()

        const productVariation = await ProductImage.find().populate({
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

        
        res.render("user/shop", { data: productVariation, category })
    } catch (error) {}
}
// ========>>>> GET (Single Product)  http://localhost:5050/products/665ea76f769f2ab99547d56e  <===============
const singleProduct = async (req,res)=>{
    const productId= req.params.id
    try {
        const productVariations = await ProductVariation.find({
            Product_item_id: { $in: product_id },
            "Product_item.product_name": product_name,
            Colour_name,
            "Size_id.size": size,
        })
            .populate({
                path: "Product_item_id",
                select: "product_name",
            })
            .populate("Size_id", "size")

        if (productVariations.length > 0) {
            console.log("Product variation exists")
        } else {
            console.log("Product variation does not exist")
        }

const productImages = getSingleProduct.Image_filename

res.render("user/shopDetails", { getSingleProduct, productImages })
        
    } catch (error) {
         console.log(error)
    }
}

module.exports = {
   
    getHome,
    singleProduct,
    getProducts,
}
