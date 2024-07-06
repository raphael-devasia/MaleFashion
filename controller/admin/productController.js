const path = require("path")
const { MongoClient, ObjectId } = require("mongodb")
const collection = require("../../models/adminSchema")
const userCollection = require("../../models/schema")
const SizeOption = require("../../models/sizeSchema")
const ProductCategory = require("../../models/productSchema")
const Size_category = require("../../models/sizeCategorySchema")
const Product = require("../../models/products")
const ProductItem = require("../../models/product_item")
const ProductVariation = require("../../models/productVariation")
const ProductImage = require("../../models/productImage")
const Colours = require("../../models/colorSchema")
const Order_line = require("../../models/order_line")
const Shop_order = require('../../models/shop_order')
const Order_status = require("../../models/order_status")
const { log } = require("console")
const { populate } = require("../../models/googleUser")
const sharp = require("sharp")
const mongoose = require("mongoose")
const Coupon = require("../../models/coupons")
const Product_offer = require('../../models/productDiscount')
const Category_offer = require("../../models/categoryDiscount")
const { body, validationResult } = require("express-validator")
const Wallet = require('../../models/wallet')
const Referral_items = require("../../models/referralItems")
const {
    fetchAllProducts,
    fetchCategories,
    fetchSingleProduct,
    findUserByEmail,
} = require("../../utils/database")

const fs = require("fs")
const { promisify } = require("util")
const Product_image = require("../../models/productImage")
const readFileAsync = promisify(fs.readFile)

async function saveImage(base64Data, uploadDirectory) {
    // Extract the content type and data
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
    if (!matches || matches.length < 1 ) {
        throw new Error("Invalid base64 string")
    }

    const contentType = matches[1]
    const base64DataBuffer = Buffer.from(matches[2], "base64")
    const filename = `image_${Date.now()}.${contentType.split("/")[1]}`

    const imagePath = path.join(uploadDirectory, filename)

    // Save the decoded data to a file
    await fs.promises.writeFile(imagePath, base64DataBuffer)
console.log("IMAGE PATH:", imagePath)
    return imagePath // Return the path where the image is saved
}

// Get Products route
const getProducts = async (req, res) => {
    const isAdmin = true

    try {
        const productVariation = await ProductImage.find({
            Is_active: true,
        }).populate({
            path: "Product_variation_id",

            populate: [
                {
                    path: "Product_item_id",
                    model: "Product_item",
                    populate: {
                        path: "Product_id",
                        model: "Product",
                        populate: {
                            path: "product_category_id",
                            model: "ProductCategory",
                        },
                    },
                },
                {
                    path: "Size_id",
                    model: "SizeOption",
                },
            ],
        })

        return res.render("productlist", { data: productVariation })
    } catch (error) {
        console.log(error)
    }
}

// Update Product POST
const updateProduct = async (req, res) => {
    const base64Images = req.body["product_images[]"]

    
    try {
        const id = req.body.id
console.log("THE ID IS:",id)
        const {
            product_name,
            category_name,
            finalSize,
            finalColour,
            SKU,
            Qty_in_stock,
            product_description,
            price,
        } = req.body

        // Resolve the category, size, and color IDs
        const categoryDoc = await ProductCategory.findOne({
            category_name: category_name,
        })

        const sizeDoc = await SizeOption.findOne({ Size_name: finalSize })
        const colourDoc = await Colours.findOne({ Colour_name: finalColour })

        // Construct the update object
        const productImage = await ProductImage.findById(id)
        const productVar = await ProductVariation.findByIdAndUpdate(
            productImage.Product_variation_id,
            { $set: { Qty_in_stock: Qty_in_stock, Size_id: sizeDoc._id } },
            { new: true }
        )

        const productItem = await ProductItem.findByIdAndUpdate(
            productVar.Product_item_id,
            {
                Product_sku: SKU,
                Original_price: price,
                Colour_id: colourDoc._id,
            },
            { new: true }
        )
        const productsDetails = await Product.findByIdAndUpdate(
            productItem.Product_id,
            {
                product_name: product_name,
                product_category_id: categoryDoc._id,
                product_description: product_description,
            },
            { new: true }
        )

        /////IMAGE WORK
        const imageFilenames = []
        const uploadDirectory = path.join(
            __dirname,
            "../../public/assets/img/product"
        )

        
        // Save base64 images and collect filenames
        if (base64Images && Array.isArray(base64Images)) {
            for (let i = 0; i < base64Images.length; i++) {

                if(i%2 !=0){
                    const base64Image = base64Images[i]
                    const savedImagePath = await saveImage(
                        base64Image,
                        uploadDirectory
                    )
                    imageFilenames.push(
                        "/assets/img/product/" + path.basename(savedImagePath)
                    )

                }

                
            }
        }


        // Create product images in database if there are any
        if (imageFilenames.length > 0) {
          const updatedImageArray=  await ProductImage.findByIdAndUpdate(
                id,
                { $push: { Image_filename: imageFilenames } },
                { new: true }
            )
            console.log(updatedImageArray)
        }

        res.redirect("/admin/products")
    } catch (error) {
        console.error("Error updating product:", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

// Get Add Products route
const addProduct = async (req, res) => {
    const isAdmin = true
    try {
        // Aggregate product data
        const product = await ProductImage.aggregate([
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
                    Product_description: {
                        $first: "$Product.product_description",
                    },
                    Product_variation_ids: {
                        $addToSet: "$Product_variation_id",
                    },
                },
            },
        ])

        // Fetch categories, size options, and color options
        const categories = await ProductCategory.find()
            .populate("size_category")
            .exec()
        const sizeOptions = await SizeOption.find()
        const colourOptions = await Colours.find()
        const msg = req.flash("info")

        // Render the addproduct page with the fetched data
        res.render("addproduct", {
            categories,
            sizeOptions,
            colourOptions,
            product, // Add aggregated product data to the rendering context
            msg: msg,
        })
    } catch (error) {
        res.redirect("/admin/login")
    }
}

// Get Single Product route
const getSingleProduct = async (req, res) => {
    const isAdmin = true
    const id = req.params.id

    const singleProduct = await ProductImage.aggregate([
        {
            $lookup: {
                from: "product_variations",
                localField: "Product_variation_id",
                foreignField: "_id",
                as: "product_variation",
            },
        },
        {
            $unwind: "$product_variation",
        },
        {
            $lookup: {
                from: "product_items",
                localField: "product_variation.Product_item_id",
                foreignField: "_id",
                as: "product_item",
            },
        },
        {
            $unwind: "$product_item",
        },
        {
            $lookup: {
                from: "products",
                localField: "product_item.Product_id",
                foreignField: "_id",
                as: "product",
            },
        },
        {
            $unwind: "$product",
        },
        {
            $lookup: {
                from: "productcategories",
                localField: "product.product_category_id",
                foreignField: "_id",
                as: "category",
            },
        },
        {
            $unwind: "$category",
        },
        {
            $lookup: {
                from: "colours",
                localField: "product_item.Colour_id",
                foreignField: "_id",
                as: "colour",
            },
        },
        {
            $unwind: "$colour",
        },
        {
            $lookup: {
                from: "sizeoptions",
                localField: "product_variation.Size_id",
                foreignField: "_id",
                as: "size_option",
            },
        },
        {
            $unwind: "$size_option",
        },
        {
            $match: {
                _id: new mongoose.Types.ObjectId(id), // No need to create a new ObjectId instance
            },
        },
    ])

    console.log(singleProduct)

    res.render("singleproduct", { data: singleProduct })
}

// Get Edit Product route
const editProduct = async (req, res) => {

    
    const isAdmin = true
    const id = req.params.id
    let singleProduct
    if (req.session.admin) {
        try {
            // Fetch categories, size options, and color options
            const categories = await ProductCategory.find()
                .populate("size_category")
                .exec()
            const sizeOptions = await SizeOption.find()
            const colourOptions = await Colours.find()

            //
            singleProduct = await ProductImage.aggregate([
                {
                    $lookup: {
                        from: "product_variations",
                        localField: "Product_variation_id",
                        foreignField: "_id",
                        as: "product_variation",
                    },
                },
                {
                    $unwind: "$product_variation",
                },
                {
                    $lookup: {
                        from: "product_items",
                        localField: "product_variation.Product_item_id",
                        foreignField: "_id",
                        as: "product_item",
                    },
                },
                {
                    $unwind: "$product_item",
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "product_item.Product_id",
                        foreignField: "_id",
                        as: "product",
                    },
                },
                {
                    $unwind: "$product",
                },
                {
                    $lookup: {
                        from: "productcategories",
                        localField: "product.product_category_id",
                        foreignField: "_id",
                        as: "category",
                    },
                },
                {
                    $unwind: "$category",
                },
                {
                    $lookup: {
                        from: "colours",
                        localField: "product_item.Colour_id",
                        foreignField: "_id",
                        as: "colour",
                    },
                },
                {
                    $unwind: "$colour",
                },
                {
                    $lookup: {
                        from: "sizeoptions",
                        localField: "product_variation.Size_id",
                        foreignField: "_id",
                        as: "size_option",
                    },
                },
                {
                    $unwind: "$size_option",
                },
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(id), // No need to create a new ObjectId instance
                    },
                },
            ])

            console.log(singleProduct)
            return res.render("editproduct", {
                categories,
                sizeOptions,
                colourOptions,
                data: singleProduct,
            })
        } catch (err) {
            console.log("an error")
        }
    }

    res.redirect("/admin/login")
}
// Get Categories
const getCategories = async (req, res) => {
    const isAdmin = true

    if (req.session.admin) {
        const categories = await ProductCategory.find({ is_deleted: false })

        return res.render("categorylist", { data: categories })
    }

    res.redirect("/admin/login")
}

// EditCategories
const editCategory = async (req, res) => {
    const isAdmin = true
    const id = req.params.id

    if (req.session.admin) {
        const categories = await ProductCategory.findById(id)

        const sizecategory = await Size_category.findById(
            categories.size_category._id
        )

        return res.render("editcategory", {
            data: categories,
            size: sizecategory,
        })
    }

    res.redirect("/admin/login")
}
// EditCategories
const addCategory = async (req, res) => {
    if (req.session.admin) {
        const size_category = await Size_category.find()
        const msg = req.flash("info")

        return res.render("addcategory", { size_category, msg })
    }

    res.redirect("/admin/login")
}
// Update Category
const updateCategory = async (req, res) => {
    const categoryId = req.params.id
    const { category_name, Category_name, category_description } = req.body

    const image = req.files ? req.files.category_image : null

    try {
        // Check if the category exists
        let existingCategory = await ProductCategory.findById(categoryId)

        if (!existingCategory) {
            return res.status(404).json({ error: "Category not found" })
        }

        // Update the category fields
        existingCategory.category_name = category_name
        existingCategory.category_description = category_description

        // Check if the size category is provided and update if necessary
        if (Category_name) {
            // Check if the size category exists
            var existingSizeCategory = await Size_category.findById(
                existingCategory.size_category
            )
            console.log(existingSizeCategory)
            if (!existingSizeCategory) {
                return res
                    .status(404)
                    .json({ error: "Size category not found" })
            }
            existingSizeCategory.Category_name = Category_name
        }

        // Check if image is provided and update if necessary
        if (image) {
            // Ensure that req.files.category_image is an image file
            if (!image.mimetype.startsWith("image/")) {
                return res
                    .status(400)
                    .json({ error: "Please upload an image file" })
            }

            // Move the uploaded file to the defined directory
            const uploadDirectory = path.join(
                __dirname,
                "../../public/assets/img/category"
            )
            await image.mv(path.join(uploadDirectory, image.name))
            existingCategory.category_image =
                "/assets/img/category/" + image.name
        }

        // Save the updated category
        await existingCategory.save()
        await existingSizeCategory.save()

        res.status(200).json({ message: "Category updated successfully" })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

// Create a Category
const addNewCategory = async (req, res) => {
    const image = req.files.category_image

    // Ensure that req.files.category_image exists and is an image file
    if (!image || !image.mimetype.startsWith("image/")) {
        return res.status(400).json({ error: "Please upload an image file" })
    }
    const category_image = "/assets/img/category/" + image.name

        const { category_name, size_category, category_description } = req.body

        try {
            const existingCategory = await ProductCategory.find({
                category_name: { $regex: new RegExp(`^${category_name}$`, 'i')}
            })
            if (existingCategory.length > 0) {
                req.flash("info", "Category already exists")
                return res.status(400).redirect("/admin/addcategory")
            }

        const uploadDirectory = path.join(
            __dirname,
            "../../public/assets/img/category"
        )
        // Move the uploaded file to the defined directory
        await image.mv(path.join(uploadDirectory, image.name))

        const newSizeCategory = await Size_category.create({
            Category_name: size_category,
        })

        const newCategory = await ProductCategory.create({
            category_name,
            category_description,
            category_image,
            size_category: newSizeCategory._id,
        })

        res.status(201).redirect("/admin/addcategory")
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
}

// Add Brand
const addBrand = async (req, res) => {
    const isAdmin = true
    if (req.session.admin) {
        const userDetails = await userCollection.find()

        return res.render("addbrand")
    }

    res.redirect("/admin/login")
}
// Delete category
const deleteCategory = async (req, res) => {
    const isAdmin = true
    const { id } = req.params

    try {
        const findCategory = await ProductCategory.findById(id)
        await ProductCategory.findByIdAndUpdate(id, { is_deleted: true })
        const allProducts = await fetchAllProducts()
        const filteredProducts = allProducts.filter((e) => {
            return (
                e.Product_Category.category_name === findCategory.category_name
            )
        })
        for (const product of filteredProducts) {
            await ProductImage.findByIdAndUpdate(e._id, { Is_active: false })
        }

        res.status(200).json({ message: "Category deleted successfully" })
    } catch (error) {
        res.status(500).json({
            error: "An error occurred while deleting the category",
        })
    }
}

// Get Brands
const getBrands = async (req, res) => {
    const isAdmin = true
    if (req.session.admin) {
        const userDetails = await userCollection.find()

        return res.render("brandlist")
    }

    res.redirect("/admin/login")
}
// Edit Brands
const editBrand = async (req, res) => {
    const isAdmin = true
    if (req.session.admin) {
        const userDetails = await userCollection.find()

        return res.render("editbrand")
    }

    res.redirect("/admin/login")
}

/////create new product  POST
// const createNewProduct = async (req, res) => {

//     const images = req.files ? req.files.product_images : null
//     console.log(req.body);
//     const imageFilenames = []
//     if (images) {
//         const uploadDirectory = path.join(
//             __dirname,
//             "../../public/assets/img/product"
//         )

//         if (Array.isArray(images)) {
//             for (let i = 0; i < images.length; i++) {
//                 const image = images[i]
//                 const imagePath = path.join(uploadDirectory, image.name)
//                 ////cropping
//                 await image.mv(imagePath)
//                 imageFilenames.push("/assets/img/product/" + image.name)
//             }
//         } else {
//             // If a single image is uploaded
//             const imagePath = path.join(uploadDirectory, images.name)
//             await images.mv(imagePath)
//             imageFilenames.push("/assets/img/product/" + images.name)
//             console.log(imagePath)
//         }
//     }

//     const {
//         category_name,
//         product_name,
//         product_description,
//         size,
//         Colour_name,
//         SKU,
//         Qty_in_stock,
//         price,
//     } = req.body

//     try {
//         const productExists = await ProductVariation.aggregate([
//             {
//                 $lookup: {
//                     from: "product_items",
//                     localField: "Product_item_id",
//                     foreignField: "_id",
//                     as: "product_item",
//                 },
//             },
//             { $unwind: "$product_item" },
//             {
//                 $lookup: {
//                     from: "products",
//                     localField: "product_item.Product_id",
//                     foreignField: "_id",
//                     as: "product",
//                 },
//             },
//             { $unwind: "$product" },
//             {
//                 $lookup: {
//                     from: "colours",
//                     localField: "product_item.Colour_id",
//                     foreignField: "_id",
//                     as: "colour",
//                 },
//             },
//             { $unwind: "$colour" },
//             {
//                 $lookup: {
//                     from: "sizeoptions",
//                     localField: "Size_id",
//                     foreignField: "_id",
//                     as: "size_option",
//                 },
//             },
//             { $unwind: "$size_option" },
//             {
//                 $match: {
//                     "product.product_name": product_name,
//                     "colour.Colour_name": Colour_name,
//                     "size_option.Size_name": size,
//                 },
//             },
//             { $count: "productCount" },
//         ])

//         if (productExists.length > 0 && productExists[0].productCount > 0) {
//             console.log("Product already exists")

//             req.flash("info", "Product Variant Exists in Database")
//             return res.status(200).redirect("/admin/addproduct")
//         } else {
//             console.log("Product does not exist")

//             const category_id = await ProductCategory.findOne({ category_name })
//             const sizeOptions = await SizeOption.find({ Size_name: size })
//             const colourname = await Colours.findOne({ Colour_name })

//             const newProduct = await Product.create({
//                 product_name,
//                 product_description,
//                 product_category_id: category_id._id,
//             })

//             const product_items = await ProductItem.create({
//                 Product_id: newProduct._id,
//                 Colour_id: colourname._id,
//                 Original_price: price,
//                 Product_sku: SKU,
//             })

//             const newVariation = await ProductVariation.create({
//                 Product_item_id: product_items._id,
//                 Size_id: sizeOptions[0]._id,
//                 Qty_in_stock,
//             })

//             if (imageFilenames.length > 0) {
//                 await ProductImage.create({
//                     Product_variation_id: newVariation._id,
//                     Image_filename: imageFilenames,
//                 })
//             }

//             res.status(201).redirect("/admin/products")
//             // res.status(201).json({ message: "Successfully added the product" })

//         }
//     } catch (err) {
//         console.error("Error creating new product:", err)
//         res.status(400).send({ error: err.message })
//     }
// }

const createNewProduct = async (req, res) => {
    const base64Images = req.body["product_images[]"]

    const {
        category_name,
        product_name,
        product_description,
        size,
        Colour_name,
        SKU,
        Qty_in_stock,
        price,
    } = req.body

    try {
        // Check if the product variation already exists
        const productExists = await ProductVariation.aggregate([
            {
                $lookup: {
                    from: "product_items",
                    localField: "Product_item_id",
                    foreignField: "_id",
                    as: "product_item",
                },
            },
            { $unwind: "$product_item" },
            {
                $lookup: {
                    from: "products",
                    localField: "product_item.Product_id",
                    foreignField: "_id",
                    as: "product",
                },
            },
            { $unwind: "$product" },
            {
                $lookup: {
                    from: "colours",
                    localField: "product_item.Colour_id",
                    foreignField: "_id",
                    as: "colour",
                },
            },
            { $unwind: "$colour" },
            {
                $lookup: {
                    from: "sizeoptions",
                    localField: "Size_id",
                    foreignField: "_id",
                    as: "size_option",
                },
            },
            { $unwind: "$size_option" },
            {
                $match: {
                    "product.product_name": product_name,
                    "colour.Colour_name": Colour_name,
                    "size_option.Size_name": size,
                },
            },
            { $count: "productCount" },
        ])

        if (productExists.length > 0 && productExists[0].productCount > 0) {
            console.log("Product variant already exists")

            req.flash("info", "Product Variant Exists in Database")
            return res.status(200).redirect("/admin/addproduct")
        } else {
            console.log("Product variant does not exist")

            // Retrieve category id, size options, and color id
            const category_id = await ProductCategory.findOne({ category_name })
            const sizeOptions = await SizeOption.find({ Size_name: size })
            const colourname = await Colours.findOne({ Colour_name })

            // Create new product, product item, and product variation
            const newProduct = await Product.create({
                product_name,
                product_description,
                product_category_id: category_id._id,
            })

            const product_items = await ProductItem.create({
                Product_id: newProduct._id,
                Colour_id: colourname._id,
                Original_price: price,
                Product_sku: SKU,
            })

            const newVariation = await ProductVariation.create({
                Product_item_id: product_items._id,
                Size_id: sizeOptions[0]._id,
                Qty_in_stock,
            })

            const imageFilenames = []
            const uploadDirectory = path.join(
                __dirname,
                "../../public/assets/img/product"
            )

            // Save base64 images and collect filenames
            if (base64Images && Array.isArray(base64Images)) {
                for (let i = 0; i < base64Images.length; i++) {
                    const base64Image = base64Images[i]
                    const savedImagePath = await saveImage(
                        base64Image,
                        uploadDirectory
                    )
                    imageFilenames.push(
                        "/assets/img/product/" + path.basename(savedImagePath)
                    )
                }
            }
           
            // Create product images in database if there are any
            if (imageFilenames.length > 0) {
                await ProductImage.create({
                    Product_variation_id: newVariation._id,
                    Image_filename: imageFilenames,
                })
            }

            // Redirect to products page after successful creation
            return res.status(201).redirect("/admin/products")
        }
    } catch (err) {
        console.error("Error creating new product:", err)
        res.status(400).send({ error: err.message })
    }
}
///// DELETE PRODUCT
const deleteProduct = async (req, res) => {
    const isAdmin = true
    const { id } = req.params
    console.log("Delete process started", id)

    try {
        await ProductImage.findByIdAndUpdate(id, { Is_active: false })
        res.status(200).json({ message: "Category deleted successfully" })
    } catch (error) {
        res.status(500).json({
            error: "An error occurred while deleting the category",
        })
    }
}
const getSales = async (req, res) => {
    const OrderDetails = await Order_line.aggregate([
        {
            $lookup: {
                from: "shop_orders",
                localField: "Order_id",
                foreignField: "_id",
                as: "Shop_orders",
            },
        },
        { $unwind: "$Shop_orders" },
        {
            $lookup: {
                from: "users",
                localField: "Shop_orders.User_id",
                foreignField: "_id",
                as: "User_details",
            },
        },
        { $unwind: "$User_details" },
        {
            $lookup: {
                from: "payment_types",
                localField: "Shop_orders.Payment_method_id",
                foreignField: "_id",
                as: "Payment_method",
            },
        },
        { $unwind: "$Payment_method" },
        {
            $lookup: {
                from: "order_statuses",
                localField: "Shop_orders.Order_status",
                foreignField: "_id",
                as: "order_statuses",
            },
        },
        { $unwind: "$order_statuses" },
    ])
console.log(OrderDetails)
    res.render("saleslist", { OrderDetails })
}
const getSaleDetails = async (req, res) => {
    const id = req.params.id

    const orderDetails = await Order_line.findById(id).populate({
        path: "Order_id",
        model: "Shop_order",
        populate: {
            path: "Order_status",
            model: "Order_status",
        },
    })

    const lengthOfProducts = orderDetails.Product_item_id.length
    
    const productArray = []
    for (let i = 0; i < lengthOfProducts; i++) {
        const data = {
            Product_item: await fetchSingleProduct(
                orderDetails.Product_item_id[i]
            ),
            Price: orderDetails.Price[i],
            Qty: orderDetails.Qty[i],
        }
        productArray.push(data)
    }
    console.log("ORDER DETAILS", orderDetails)
    console.log("PRODUCTS ARRAY:", productArray)

    res.render("sales-details", { orderDetails, productArray })
}
const deleteOrder = async (req, res) => {
    const id = req.params.id

    try {
        const orderDetails = await Order_line.findById(id).populate({
            path: "Order_id",
            model: "Shop_order",
            populate: {
                path: "Order_status",
                model: "Order_status",
            },
        })

        if (!orderDetails) {
            return res.status(404).json({ message: "Order not found" })
        }

        const orderStatusId = orderDetails.Order_id.Order_status._id

        // Step 2: Update the Status field
        const statusUpdate = await Order_status.findByIdAndUpdate(
            orderStatusId,
            { $set: { Status: "Cancelled" } },
            { new: true } // To return the updated document
        )

        if (!statusUpdate) {
            return res
                .status(500)
                .json({ message: "Order status not found or not updated." })
        }

        console.log("Order status updated successfully:", statusUpdate)

        const lengthOfProducts = orderDetails.Product_item_id.length
        const productArray = []

        for (let i = 0; i < lengthOfProducts; i++) {
            const data = {
                Product_item: await fetchSingleProduct(
                    orderDetails.Product_item_id[i]
                ),
                Price: orderDetails.Price[i],
                Qty: orderDetails.Qty[i],
            }
            productArray.push(data)
        }

        for (const e of productArray) {
            await ProductVariation.findByIdAndUpdate(
                e.Product_item.Product_variation_id._id,
                { $inc: { Qty_in_stock: e.Qty } }
            )
        }

        res.status(200).json({
            message: "Successfully Cancelled The order",
        })
    } catch (error) {
        console.error("Error deleting order:", error)
        res.status(500).json({
            message: "Error deleting order",
            error: error.message,
        })
    }
}
const updateOrder = async (req, res) => {
    const { id, status } = req.query
    try {
        const orderDetails = await Order_line.findById(id).populate({
            path: "Order_id",
            model: "Shop_order",
            populate: {
                path: "Order_status",
                model: "Order_status",
            },
        })

        if (!orderDetails) {
            return res.status(404).send("Order not found")
        }

        const orderStatusId = orderDetails.Order_id.Order_status._id

        const statusUpdate = await Order_status.findByIdAndUpdate(
            orderStatusId,
            { $set: { Status: status } },
            { new: true }
        )

        if (!statusUpdate) {
            return res.status(500).send("Failed to update status")
        }

        res.status(200).send("Status updated successfully")
    } catch (error) {
        console.error("Error updating status:", error)
        res.status(500).send("Error updating status")
    }
}
const getAddCoupon = async (req,res) =>{
    res.render('addcoupon')
}
const postAddCoupon = async (req,res)=>{
    const {
        offer_percentage,
        coupon_code,
        start_date,
        end_date,
        coupon_description,
    } = req.body
    // Validate the request body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    // Additional date validations
    if (new Date(start_date) < new Date().setHours(0, 0, 0, 0)) {
        return res
            .status(400)
            .json({ errors: [{ msg: "Start date cannot be in the past." }] })
    }
    if (new Date(end_date) < new Date(start_date)) {
        return res
            .status(400)
            .json({
                errors: [{ msg: "End date must be after the start date." }],
            })
    }

    try {
        // Check if the coupon code already exists
        const existingOffer = await Coupon.findOne({ coupon_code })
        if (existingOffer) {
            return res
                .status(400)
                .json({ errors: [{ msg: "Coupon code already exists." }] })
        }

        const newOffer = new Coupon({
            coupon_code,
            offer_percentage,
            start_date,
            end_date,
            coupon_description,
        })

        await newOffer.save()
        res.status(201).json({
            message: "Coupon created successfully",
            coupon: newOffer,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server error" })
    }
}



const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find()
        res.render("couponlist", { coupons })
    } catch (error) {
        console.error(error)
        res.status(500).send("Server Error")
    }
}
const getProductDiscount = async (req,res)=>{
      try {
          const productVariation = await ProductImage.find({
              Is_active: true,
          }).populate({
              path: "Product_variation_id",

              populate: [
                  {
                      path: "Product_item_id",
                      model: "Product_item",
                      populate: {
                          path: "Product_id",
                          model: "Product",
                          populate: {
                              path: "product_category_id",
                              model: "ProductCategory",
                          },
                      },
                  },
                  {
                      path: "Size_id",
                      model: "SizeOption",
                  },
              ],
          })
          console.log(
              productVariation
          )
res.render("add-product-discount", { data: productVariation })
          
      } catch (error) {
          console.log(error)
      }
    
}
 const getCategoryDiscount = async (req,res)=>{
     const categories = await ProductCategory.find()
    res.render("add-category-discount",{categories})
 }

///LIST 
const getProductDiscountList = async (req,res)=>{ 
        
         const offers = await Product_offer.find().populate({
             path: "Product_id",
             model: ProductImage,
             populate: {
                 path: "Product_variation_id",
                 model: ProductVariation,
                 populate: {
                     path: "Product_item_id",
                     model: ProductItem,
                     populate: {
                         path: "Product_id",
                         model: Product,
                     },
                 },
             },
         })
         console.log(offers)
         
        res.render("productofferlist", { offers })
    }


const getCategoryDiscountList = async (req,res)=>{

         const offers = await Category_offer.find().populate({
             path: "category_id",
             model:ProductCategory
         })

         res.render("category-offer-list", { offers })
     }
     const addProductDiscount = async (req, res) => {
        const {
            product_name,
             offer_percentage,
            
            start_date,
            end_date,
            offer_description,
        } = req.body
        // Validate the request body
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        // Additional date validations
        if (new Date(start_date) < new Date().setHours(0, 0, 0, 0)) {
            return res
                .status(400)
                .json({
                    errors: [{ msg: "Start date cannot be in the past." }],
                })
        }
        if (new Date(end_date) < new Date(start_date)) {
            return res.status(400).json({
                errors: [{ msg: "End date must be after the start date." }],
            })
        }

        try {
            // Check if the coupon code already exists
            const existingOffer = await Product_offer.findOne({
                Product_id: product_name,
                offer_percentage: offer_percentage,
                start_date: start_date,
                end_date: end_date,
            })
            if (existingOffer) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: "Offer already exists." }] })
            }

            const newOffer = new Product_offer({
                Product_id:product_name,
                offer_percentage,
                start_date,
                end_date,
                offer_description,
            })

            await newOffer.save()
            const productImage = await ProductImage.findById(product_name)
            const productVariation = await ProductVariation.findById(
                productImage.Product_variation_id
            )
            const productItem = await ProductItem.findByIdAndUpdate(
                productVariation.Product_item_id,
                { $set: { Offer_price_id: newOffer._id} },{new:true}
            )

            console.log(productItem)
           
            res.status(201).json({
                message: "Offer created successfully",
                coupon: newOffer,
            })
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: "Server error" })
        }
     }



     const addCategoryDiscount = async (req, res) => {
         const {
             category_name,
             offer_percentage,

             start_date,
             end_date,
             offer_description,
         } = req.body

         
         // Validate the request body
         const errors = validationResult(req)
         if (!errors.isEmpty()) {
             return res.status(400).json({ errors: errors.array() })
         }

         // Additional date validations
         if (new Date(start_date) < new Date().setHours(0, 0, 0, 0)) {
             return res.status(400).json({
                 errors: [{ msg: "Start date cannot be in the past." }],
             })
         }
         if (new Date(end_date) < new Date(start_date)) {
             return res.status(400).json({
                 errors: [{ msg: "End date must be after the start date." }],
             })
         }

         try {
             // Check if the coupon code already exists
             const existingOffer = await Category_offer.findOne({
                 category_id: category_name,
                 offer_percentage: offer_percentage,
                 start_date: start_date,
                 end_date: end_date,
             })
             if (existingOffer) {
                 return res
                     .status(400)
                     .json({ errors: [{ msg: "Offer already exists." }] })
             }

             const newOffer = new Category_offer({
                 category_id: category_name,
                 offer_percentage,
                 start_date,
                 end_date,
                 offer_description,
             })

             await newOffer.save()
             const category = await ProductCategory.findByIdAndUpdate(
                 category_name,
                 { $set: { Offer_price_id: newOffer._id} }, {new:true}
             )
             console.log(category)
             res.status(201).json({
                 message: "Offer created successfully",
                 coupon: newOffer,
             })
         } catch (error) {
             console.error(error)
             res.status(500).json({ message: "Server error" })
         }
     }
//      const getSalesReport = async (req,res)=>{

//         const productDetails = await Order_line.aggregate([
//             {
//                 $lookup: {
//                     from: "shop_orders",
//                     localField: "Order_id",
//                     foreignField: "_id",
//                     as: "Shop_Orders",
//                 },
//             },
//             { $unwind: "$Shop_Orders" },
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "Shop_Orders.User_id",
//                     foreignField: "_id",
//                     as: "User",
//                 },
//             },
//             { $unwind: "$User" },
//             {
//                 $lookup: {
//                     from: "payment_types",
//                     localField: "Shop_Orders.Payment_method_id",
//                     foreignField: "_id",
//                     as: "Payment_type",
//                 },
//             },
//             { $unwind: "$Payment_type" },
//             {
//                 $lookup: {
//                     from: "order_statuses",
//                     localField: "Shop_Orders.Order_status",
//                     foreignField: "_id",
//                     as: "Status",
//                 },
//             },
//             { $unwind: "$Status" },
//         ])
//         console.log(productDetails)
//         let totalRevenue =0
//         let totalDiscount =0
//         let couponDiscount =0


// let totalOrders = productDetails.length






//          productDetails.forEach ((order)=>{
//              totalRevenue += order.Shop_Orders.Order_total
//              totalDiscount += order.Shop_Orders.Sales_discount
//              couponDiscount += order.Shop_Orders.Coupon_discount
//         })

//         const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0
//         res.render("salesreport", {
//             productDetails,
//             totalRevenue,
//             couponDiscount,
//             totalDiscount,
//             averageOrderValue,
//         })
//      }

const getSalesReport = async (req, res) => {
    // Extract query parameters
    const { dateRange, fromDate, toDate } = req.query

    

    try {
        const pipeline = [
            {
                $lookup: {
                    from: "shop_orders",
                    localField: "Order_id",
                    foreignField: "_id",
                    as: "Shop_Orders",
                },
            },
            { $unwind: "$Shop_Orders" },
            {
                $lookup: {
                    from: "users",
                    localField: "Shop_Orders.User_id",
                    foreignField: "_id",
                    as: "User",
                },
            },
            { $unwind: "$User" },
            {
                $lookup: {
                    from: "payment_types",
                    localField: "Shop_Orders.Payment_method_id",
                    foreignField: "_id",
                    as: "Payment_type",
                },
            },
            { $unwind: "$Payment_type" },
            {
                $lookup: {
                    from: "order_statuses",
                    localField: "Shop_Orders.Order_status",
                    foreignField: "_id",
                    as: "status",
                },
            },
            { $unwind: "$status" },
        ]

        const filteredProductDetails = await Order_line.aggregate(
            pipeline
        ).exec()
        // Filter out non-delivered products
        const productDetails = filteredProductDetails
            .map((order) => {
                const deliveredIndexes = order.Status.map((status, index) =>
                    status === "Delivered" ? index : -1
                ).filter((index) => index !== -1)

                return {
                    ...order,
                    Product_item_id: order.Product_item_id.filter((_, index) =>
                        deliveredIndexes.includes(index)
                    ),
                    Product_name: order.Product_name.filter((_, index) =>
                        deliveredIndexes.includes(index)
                    ),
                    Price: order.Price.filter((_, index) =>
                        deliveredIndexes.includes(index)
                    ),
                    Offer_percentage: order.Offer_percentage.filter(
                        (_, index) => deliveredIndexes.includes(index)
                    ),
                    Qty: order.Qty.filter((_, index) =>
                        deliveredIndexes.includes(index)
                    ),
                    Status: order.Status.filter((_, index) =>
                        deliveredIndexes.includes(index)
                    ),
                    Coupon_percentage: order.Coupon_percentage.filter(
                        (_, index) => deliveredIndexes.includes(index)
                    ),
                }
            })
            .filter((order) => order.Status.length > 0) 
        console.log(productDetails)

        let totalRevenue = 0
        let totalDiscount = 0
        let couponDiscount = 0

        let totalOrders = productDetails.length

        productDetails.forEach((order) => {
            totalRevenue += order.Shop_Orders.Order_total
            totalDiscount += order.Shop_Orders.Sales_discount
            couponDiscount += order.Shop_Orders.Coupon_discount
        })

        const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0
        
        res.render("salesreport", {
            productDetails,
            totalRevenue,
            couponDiscount,
            totalDiscount,
            averageOrderValue,
        })
    } catch (error) {
        console.error("Error fetching sales report:", error)
        res.status(500).json({
            error: "An error occurred while fetching the sales report.",
        })
    }
}
const cancelItem = async (req, res) => {
    // const order_Id = req.query.orderId
    // const product_image_id = req.params.id
    // const orderId = new ObjectId(order_Id)
    // const productItemId = new ObjectId(product_image_id)
     const orderId = req.query.orderId
     const productItemId = req.params.id
     
console.log(orderId, productItemId)
    const order = await Order_line.findById(orderId)

    if (order) {
        // Get the index of the product item to be removed
        const index = order.Product_item_id.findIndex((id) =>
            id.equals(productItemId)
        )

        if (index !== -1) {
            // Update the document to remove the item at the identified index from all arrays
            // Construct the field path for the specific quantity to be updated
            const quantityFieldPath = `Qty.${index}`
            const statusFieldPath = `Status.${index}`
            const storeDiscount =
                (order.Qty[index] *
                    order.Price[index] *
                    order.Offer_percentage[index]) /
                100
            const couponDiscount =
                (order.Qty[index] *
                    order.Price[index] *
                    order.Coupon_percentage[index]) /
                100
            const productActualCost = order.Qty[index] * order.Price[index]
            const productCost =
                productActualCost - couponDiscount - storeDiscount

            // Update the document to set the quantity to zero
            const updateResult = await Order_line.updateOne(
                { _id: orderId },
                {
                    $set: {
                        [quantityFieldPath]: 0,
                        [statusFieldPath]: "Cancelled",
                    },
                }
            )
            const Product_Image = await ProductImage.findById(productItemId)
            const stockUpdate = await ProductVariation.findByIdAndUpdate(
                Product_Image.Product_variation_id,
                { $inc: { Qty_in_stock: order.Qty[index] } }
            )
            const shop_order = await Shop_order.findByIdAndUpdate(
                order.Order_id,
                {
                    $inc: {
                        Product_cost: -productActualCost,
                        Coupon_discount: -couponDiscount,
                        Sales_discount: -storeDiscount,
                        Order_total: -productCost,
                    },
                }
            )

            const OrderStatus = await Order_status.findById(
                shop_order.Order_status
            )
            if (OrderStatus.Status == "Paid") {
               
                const findWallet = await Wallet.findOneAndUpdate(
                    { user_id: shop_order.User_id },
                    { $inc: { Wallet_amount: productCost } }
                )
                const transaction = await Referral_items.create({
                    Referral_Amount: productCost,
                    Status: "Shop Refund",
                    Wallet_id: findWallet._id,
                })
            }
            res.redirect(`/admin/sales/saledetails/${orderId }`)
        } else {
            //  res.redirect(`/admin/sales/saledetails/${order_Id}`)
            console.log("failur 1");
        }
    } else {
        console.log("failur 2");
        // res.redirect(`/admin/sales/saledetails/${order_Id}`)
    }
}

const shipItem = async (req, res) => {
    const orderId = req.query.orderId
    const productItemId = req.params.id

    try {
        const order = await Order_line.findById(orderId)

        if (order) {
            // Get the index of the product item to be updated
            const index = order.Product_item_id.findIndex((id) =>
                id.equals(productItemId)
            )

            if (index !== -1) {
                // Construct the field path for the specific status to be updated
                const statusFieldPath = `Status.${index}`

                // Update the document to set the status to 'Shipped'
                await Order_line.updateOne(
                    { _id: orderId },
                    {
                        $set: {
                            [statusFieldPath]: "Shipped",
                        },
                    }
                )

                res.redirect(`/admin/sales/saledetails/${orderId}`)
            } else {
                console.log("Failure 1: Product item not found in the order.")
                res.redirect(`/admin/sales/saledetails/${orderId}`)
            }
        } else {
            console.log("Failure 2: Order not found.")
            res.redirect(`/admin/sales/saledetails/${orderId}`)
        }
    } catch (error) {
        console.error("Error updating order status:", error)
        res.status(500).send("Internal Server Error")
    }
}
const refundItem = async (req, res) => {
    
    const orderId = req.query.orderId
    const productItemId = req.params.id

 
    const order = await Order_line.findById(orderId)

    if (order) {
        // Get the index of the product item to be removed
        const index = order.Product_item_id.findIndex((id) =>
            id.equals(productItemId)
        )

        if (index !== -1) {
            // Update the document to remove the item at the identified index from all arrays
            // Construct the field path for the specific quantity to be updated
            const quantityFieldPath = `Qty.${index}`
            const statusFieldPath = `Status.${index}`
            const storeDiscount =
                (order.Qty[index] *
                    order.Price[index] *
                    order.Offer_percentage[index]) /
                100
            const couponDiscount =
                (order.Qty[index] *
                    order.Price[index] *
                    order.Coupon_percentage[index]) /
                100
            const productActualCost = order.Qty[index] * order.Price[index]
            const productCost =
                productActualCost - couponDiscount - storeDiscount

            // Update the document to set the quantity to zero
            const updateResult = await Order_line.updateOne(
                { _id: orderId },
                {
                    $set: {
                        [quantityFieldPath]: 0,
                        [statusFieldPath]: "Refunded",
                    },
                }
            )
            const Product_Image = await ProductImage.findById(productItemId)
            const stockUpdate = await ProductVariation.findByIdAndUpdate(
                Product_Image.Product_variation_id,
                { $inc: { Qty_in_stock: order.Qty[index] } }
            )
            const shop_order = await Shop_order.findByIdAndUpdate(
                order.Order_id,
                {
                    $inc: {
                        Product_cost: -productActualCost,
                        Coupon_discount: -couponDiscount,
                        Sales_discount: -storeDiscount,
                        Order_total: -productCost,
                    },
                }
            )

                const findWallet = await Wallet.findOneAndUpdate(
                    { user_id: shop_order.User_id },
                    { $inc: { Wallet_amount: productCost } }
                )
                const transaction = await Referral_items.create({
                    Referral_Amount: productCost,
                    Status: "Shop Refund",
                    Wallet_id: findWallet._id,
                })
           
            res.redirect(`/admin/sales/saledetails/${orderId}`)
            }
             } else {
        
        res.redirect(`/admin/sales/saledetails/${orderId}`)
    }
}
const deleteImage = async (req,res)=> {
   
    try {
        const { image, productId } = req.body;
       

        // Find the product by ID
        const product = await Product_image.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Remove the image from the product's images array
        product.Image_filename = product.Image_filename.filter(img => img !== image);
        
        // Save the updated product
        await product.save();
        const updatedProduct = await Product_image.findById(productId)
        const newImageList = updatedProduct.Image_filename

        res.status(200).json({
            success: true, // Ensure success is true
            message: "Image removed successfully",
            newImageList: newImageList,
        })
    } catch (error) {
        console.error('Error removing image:', error);
        res.status(500).json({ message: 'An error occurred while removing the image' });
    }
}

     module.exports = {
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
         shipItem,
         refundItem,
         deleteImage
     }
