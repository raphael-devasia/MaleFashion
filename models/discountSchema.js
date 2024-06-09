const mongoose = require("mongoose")
const { Schema } = mongoose

const discountSchema = new Schema({
    discount_type: {
        type: String,
        enum: ["percentage", "fixed"],
        required: true,
    },
    discount_value: {
        type: Number,
        required: true,
    },
    applicable_products: [
        {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: false,
        },
    ],
    applicable_categories: [
        {
            type: Schema.Types.ObjectId,
            ref: "ProductCategory",
            required: false,
        },
    ],
    start_date: {
        type: Date,
        required: true,
    },
    end_date: {
        type: Date,
        required: true,
    },
    is_active: {
        type: Boolean,
        default: true,
    },
})

const Discount = mongoose.model("Discount", discountSchema)

module.exports = Discount
