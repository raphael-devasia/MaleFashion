// services/categoryService.js
const ProductCategory = require("../models/productSchema")
const SizeCategory = require("../models/sizeCategorySchema")
const ProductImage = require("../models/productImage")
const CategoryOffer = require("../models/categoryDiscount")
const { AppError } = require("../utils/errors")

class CategoryService {
    static async getAllCategories() {
        return await ProductCategory.find({ is_deleted: false })
    }

    static async getCategoryById(id) {
        const category = await ProductCategory.findById(id)
        if (!category) throw new AppError("Category not found", 404)
        return category
    }

    static async addCategory(data, imageUrl) {
        // Changed from image to imageUrl
        const { category_name, size_category, category_description } = data
        const existing = await ProductCategory.findOne({
            category_name: { $regex: new RegExp(`^${category_name}$`, "i") },
        })
        if (existing) throw new AppError("Category already exists", 400)

        const newSizeCategory = await SizeCategory.create({
            Category_name: size_category,
        })
        const category_image = imageUrl || null // Use S3 URL or null if no image
        return await ProductCategory.create({
            category_name,
            category_description,
            category_image,
            size_category: newSizeCategory._id,
        })
    }

    static async updateCategory(id, data, imageUrl) {
        // Changed from image to imageUrl
        const { category_name, Category_name, category_description } = data
        const category = await ProductCategory.findById(id)
        if (!category) throw new AppError("Category not found", 404)

        category.category_name = category_name
        category.category_description = category_description
        if (Category_name) {
            const sizeCategory = await SizeCategory.findById(
                category.size_category
            )
            if (!sizeCategory)
                throw new AppError("Size category not found", 404)
            sizeCategory.Category_name = Category_name
            await sizeCategory.save()
        }
        if (imageUrl) {
            category.category_image = imageUrl // Store S3 URL
        }
        await category.save()
    }

    static async deleteCategory(id) {
        const category = await ProductCategory.findById(id)
        if (!category) throw new AppError("Category not found", 404)

        await ProductCategory.findByIdAndUpdate(id, { is_deleted: true })
        await CategoryOffer.deleteMany({ category_id: id })
        const products = await ProductImage.find({
            "Product_variation_id.Product_item_id.Product_id.product_category_id":
                id,
        })
        await Promise.all(
            products.map((p) =>
                ProductImage.findByIdAndUpdate(p._id, { Is_active: false })
            )
        )
    }

    static async getAddCategoryData() {
        try {
            const size_category = await SizeCategory.find()
            return { size_category }
        } catch (error) {
            throw new AppError("Failed to fetch size categories", 500)
        }
    }
}

module.exports = CategoryService
