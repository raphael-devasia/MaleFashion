const ProductOffer = require("../models/productDiscount")
const CategoryOffer = require("../models/categoryDiscount")
const ProductImage = require("../models/productImage")
const ProductVariation = require("../models/productVariation")
const ProductItem = require("../models/product_item")
const ProductCategory = require("../models/productSchema")
const { AppError } = require("../utils/errors")

class DiscountService {
    static async getProductDiscounts() {
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

    static async getCategoryDiscounts() {
        return await ProductCategory.find()
    }

    static async getProductDiscountList() {
        const offers = await ProductOffer.find().populate({
            path: "Product_id",
            model: ProductImage,
            populate: {
                path: "Product_variation_id",
                model: ProductVariation,
                populate: {
                    path: "Product_item_id",
                    model: ProductItem,
                    populate: { path: "Product_id", model: "Product" },
                },
            },
        })
        return offers.filter((offer) => offer.Product_id.Is_active)
    }

    static async getCategoryDiscountList() {
        return await CategoryOffer.aggregate([
            {
                $lookup: {
                    from: "productcategories",
                    localField: "category_id",
                    foreignField: "_id",
                    as: "category_id",
                },
            },
            { $unwind: "$category_id" },
            {
                $project: {
                    _id: 1,
                    offer_percentage: 1,
                    start_date: 1,
                    end_date: 1,
                    offer_description: 1,
                    category_id: {
                        _id: 1,
                        category_name: 1,
                        category_image: 1,
                    },
                },
            },
        ])
    }

    static async addProductDiscount(data) {
        const {
            product_name,
            offer_percentage,
            start_date,
            end_date,
            offer_description,
        } = data
        const existing = await ProductOffer.findOne({
            Product_id: product_name,
            offer_percentage,
            start_date,
            end_date,
        })
        if (existing) throw new AppError("Offer already exists", 400)

        const newOffer = await ProductOffer.create({
            Product_id: product_name,
            offer_percentage,
            start_date,
            end_date,
            offer_description,
        })
        const productImage = await ProductImage.findById(product_name)
        const productVariation = await ProductVariation.findById(
            productImage.Product_variation_id
        )
        await ProductItem.findByIdAndUpdate(productVariation.Product_item_id, {
            Offer_price_id: newOffer._id,
        })
    }

    static async addCategoryDiscount(data) {
        const {
            category_name,
            offer_percentage,
            start_date,
            end_date,
            offer_description,
        } = data
        const existing = await CategoryOffer.findOne({
            category_id: category_name,
            offer_percentage,
            start_date,
            end_date,
        })
        if (existing) throw new AppError("Offer already exists", 400)

        const newOffer = await CategoryOffer.create({
            category_id: category_name,
            offer_percentage,
            start_date,
            end_date,
            offer_description,
        })
        await ProductCategory.findByIdAndUpdate(category_name, {
            Offer_price_id: newOffer._id,
        })
    }

    static async deleteCategoryOffer(id) {
        const offer = await CategoryOffer.findByIdAndDelete(id)
        if (!offer) throw new AppError("Offer not found", 404)
    }
    static async deleteProductOffer(id) {
        const offer = await ProductOffer.findByIdAndDelete(id)
        if (!offer) throw new AppError("Offer not found", 404)
    }
}

module.exports = DiscountService
