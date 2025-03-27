const Product = require("../models/products")
const ProductItem = require("../models/product_item")
const ProductVariation = require("../models/productVariation")
const ProductImage = require("../models/productImage")
const ProductCategory = require("../models/productSchema")
const SizeOption = require("../models/sizeSchema")
const Colours = require("../models/colorSchema")
const mongoose = require('mongoose')
const { saveImage } = require("../utils/imageUtils")
const { AppError } = require("../utils/errors")

class ProductService {
    static async getAllProducts() {
        return await ProductImage.find({ Is_active: true }).populate({
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
                { path: "Size_id", model: "SizeOption" },
            ],
        })
    }
    static async getAddProductData() {
        try {
            const categories = await ProductCategory.find()
                .populate("size_category")
                .exec()
            const sizeOptions = await SizeOption.find()
            const colourOptions = await Colours.find()
            return { categories, sizeOptions, colourOptions }
        } catch (error) {
            throw new AppError("Failed to fetch product data", 500)
        }
    }
    static async checkExistingVariation(product_name, Colour_name, size,id=null) {
        try {
            const productExists = await ProductImage.aggregate([
                {
                    $lookup: {
                        from: "product_variations", // Collection name for ProductItem
                        localField: "Product_variation_id",
                        foreignField: "_id",
                        as: "product_variations",
                    },
                },
                { $unwind: "$product_variations" },

                // Join ProductVariation with ProductItem
                {
                    $lookup: {
                        from: "product_items", // Collection name for ProductItem
                        localField: "product_variations.Product_item_id",
                        foreignField: "_id",
                        as: "product_item",
                    },
                },
                { $unwind: "$product_item" },

                // Join ProductItem with Product
                {
                    $lookup: {
                        from: "products", // Collection name for Product
                        localField: "product_item.Product_id",
                        foreignField: "_id",
                        as: "product",
                    },
                },
                { $unwind: "$product" },

                // Join ProductItem with Colours
                {
                    $lookup: {
                        from: "colours", // Collection name for Colours
                        localField: "product_item.Colour_id",
                        foreignField: "_id",
                        as: "colour",
                    },
                },
                { $unwind: "$colour" },

                // Join ProductVariation with SizeOption
                {
                    $lookup: {
                        from: "sizeoptions", // Collection name for SizeOption
                        localField: "Size_id",
                        foreignField: "_id",
                        as: "size_option",
                    },
                },
                { $unwind: "$size_option" },

                // Match the product_name, Colour_name, and Size_name
                {
                    $match: {
                        "product.product_name": product_name,
                        "colour.Colour_name": Colour_name,
                        "size_option.Size_name": size,
                        ...(id && { _id: { $ne: id } }), // Exclude current product if updating
                    },
                },

                // Count matching documents
                { $count: "productCount" },
            ])

            // Return true if a match exists, false otherwise
            return productExists.length > 0 && productExists[0].productCount > 0
        } catch (error) {
            console.error("Error in checkExistingVariation:", error)
            throw new AppError("Failed to check existing variation", 500)
        }
    }

    static async getProductById(productId) {
       

        const product = await ProductImage.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(productId) } },
            {
                $lookup: {
                    from: "product_variations",
                    localField: "Product_variation_id",
                    foreignField: "_id",
                    as: "product_variation",
                },
            },
            { $unwind: "$product_variation" },
            {
                $lookup: {
                    from: "product_items",
                    localField: "product_variation.Product_item_id",
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
                    from: "productcategories",
                    localField: "product.product_category_id",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: "$category" },
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
                    localField: "product_variation.Size_id",
                    foreignField: "_id",
                    as: "size_option",
                },
            },
            { $unwind: "$size_option" },
        ])
        if (!product.length) throw new AppError("Product not found", 404)
        return product
    }

    // Simplified updateProduct
    static async updateProduct(id, data) {
        try {
            const {
                product_name,
                product_description,
                category_name,
                Colour_name,
                size,
                SKU,
                Qty_in_stock,
                price,
                images,
            } = data

            // Basic validation
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new AppError("Invalid variation ID", 400)
            }
            if (
                !product_name ||
                !category_name ||
                !Colour_name ||
                !size ||
                !SKU ||
                !Qty_in_stock ||
                !price||!product_description
            ) {
                throw new AppError("Missing required fields", 400)
            }
            if (!images || images.length < 3 || images.length > 5) {
                throw new AppError(
                    "Product must have between 3 and 5 images",
                    400
                )
            }

            // Check for duplicate variation (excluding current)
            const isDuplicate = await this.checkExistingVariation(
                product_name,
                Colour_name,
                size,
                id
            )
            if (isDuplicate) {
                throw new AppError("Product variant already exists", 409)
            }

            // Fetch related IDs
            const [category, sizeOption, colour] = await Promise.all([
                ProductCategory.findOne({ category_name }),
                SizeOption.findOne({ Size_name: size }),
                Colours.findOne({ Colour_name }),
            ])

            if (!category)
                throw new AppError(`Category '${category_name}' not found`, 404)
            if (!colour)
                throw new AppError(`Colour '${Colour_name}' not found`, 404)
            if (!sizeOption) throw new AppError(`Size '${size}' not found`, 404)

            

            // Construct the update object
            const productImage = await ProductImage.findByIdAndUpdate(
                id,
                { Image_filename: images }
            )
            const productVar = await ProductVariation.findByIdAndUpdate(
                productImage.Product_variation_id,
                {
                    $set: {
                        Qty_in_stock: Qty_in_stock,
                        Size_id: sizeOption._id,
                    },
                },
                { new: true }
            )

            const productItem = await ProductItem.findByIdAndUpdate(
                productVar.Product_item_id,
                {
                    Product_sku: SKU,
                    Original_price: price,
                    Colour_id: colour._id,
                },
                { new: true }
            )
            
            console.log('the prodyct item is ',productItem)
            
             const product = await Product.findByIdAndUpdate(
                 productItem.Product_id,
                 {
                     product_name: product_name,
                     product_description: product_description,
                 },
                 { new: true }
             )
             console.log(product)
             
            
           
            return
            
        } catch (error) {
            console.error("Error in updateProduct:", error.message)
            throw error instanceof AppError
                ? error
                : new AppError("Failed to update product", 500)
        }
    }

   
    static async createProduct(data) {
        const {
            productType,
            product_id,
            category_name,
            product_name,
            product_description,
            size,
            Colour_name,
            SKU,
            Qty_in_stock,
            price,
            images,
        } = data

        // New product case
        const category = await ProductCategory.findOne({ category_name })
        if (!category) {
            throw new AppError("Category not found", 404)
        }

        const sizeOption = await SizeOption.findOne({ Size_name: size })
        const colour = await Colours.findOne({ Colour_name })
        if (!sizeOption || !colour) {
            throw new AppError("Size or color not found", 404)
        }

        const newProduct = await Product.create({
            product_name,
            product_description,
            product_category_id: category._id,
        })

        const productItem = await ProductItem.create({
            Product_id: newProduct._id,
            Colour_id: colour._id,
            Original_price: price,
            Product_sku: SKU,
        })

        const newVariation = await ProductVariation.create({
            Product_item_id: productItem._id,
            Size_id: sizeOption._id,
            Qty_in_stock,
        })

        if (images && Array.isArray(images) && images.length > 0) {
            await ProductImage.create({
                Product_variation_id: newVariation._id,
                Image_filename: images,
            })
        }

        return { product: newProduct, variation: newVariation }
    }

    static async deleteProduct(id) {
        const product = await ProductImage.findByIdAndUpdate(id, {
            Is_active: false,
        })
        if (!product) throw new AppError("Product not found", 404)
    }

    static async deleteImage(productId, image) {
        const product = await ProductImage.findById(productId)
        if (!product) throw new AppError("Product not found", 404)
        product.Image_filename = product.Image_filename.filter(
            (img) => img !== image
        )
        await product.save()
        return product.Image_filename
    }
}

module.exports = ProductService
