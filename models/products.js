const mongoose = require("mongoose")
const { Schema } = mongoose
const Size_category = require("./sizeCategorySchema")

const productSchema = new Schema({
    product_name: {
        type: String,
        required: true,
    },
    product_category_id: {
        type: Schema.Types.ObjectId,
        ref: "ProductCategory", 
        required: true,
    },
    product_description: {
        type: String,
        required: true,
    },
    // brand_id: {
    //     type: Schema.Types.ObjectId,
    //     ref: "Brand", // Assuming there's a Brand model
    //     required: true,
    // },
    // review_id: {
    //     type: Schema.Types.ObjectId,
    //     ref: "Review", // Assuming there's a Review model
    //     required: true,
    // },
    // information: {
    //     type: String,
    //     required: true,
    // },
    is_active: {
        type: Boolean,
        default: true,
    },
})

// // Add a static method for soft deleting a document
// productSchema.statics.softDelete = async function (id) {
//     return this.findByIdAndUpdate(id, { is_deleted: true })
// }

// // Add a static method for restoring a soft deleted document
// productSchema.statics.restore = async function (id) {
//     return this.findByIdAndUpdate(id, { is_deleted: false })
// }

// // Ensure queries only return documents that are not soft deleted by default
// productSchema.pre("find", function () {
//     this.where({ is_deleted: false })
// })

// productSchema.pre("findOne", function () {
//     this.where({ is_deleted: false })
// })

// productSchema.pre("findOneAndUpdate", function () {
//     this.where({ is_deleted: false })
// })

const Product = mongoose.model("Product", productSchema)

module.exports = Product
