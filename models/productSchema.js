const mongoose = require("mongoose")
const { Schema } = mongoose
const Size_category = require("./sizeCategorySchema")

const productCategorySchema = new Schema({
    category_name: {
        type: String,
        required: [true, "Path `category_name` is required."],
    },
    category_description: {
        type: String,
        required: [true, "Path `category_description` is required."],
    },
    category_image: {
        type: String,
        required: [true, "Path `category_image` is required."],
    },
    size_category: {
        type: Schema.Types.ObjectId,
        ref: "Size_category",
    },
    Offer_price_id: {
        type: Schema.Types.ObjectId,
        ref: "Category_offer",
    },
    is_deleted: {
        type: Boolean,
        default: false,
    },
})

// Add a static method for soft deleting a document
productCategorySchema.statics.softDelete = async function(id) {
    return this.findByIdAndUpdate(id, { is_deleted: true });
};

// Add a static method for restoring a soft deleted document
productCategorySchema.statics.restore = async function(id) {
    return this.findByIdAndUpdate(id, { is_deleted: false });
};

// Ensure queries only return documents that are not soft deleted by default
productCategorySchema.pre('find', function() {
    this.where({ is_deleted: false });
});

productCategorySchema.pre('findOne', function() {
    this.where({ is_deleted: false });
});

productCategorySchema.pre('findOneAndUpdate', function() {
    this.where({ is_deleted: false });
});

const ProductCategory = mongoose.model("ProductCategory", productCategorySchema)

module.exports = ProductCategory
