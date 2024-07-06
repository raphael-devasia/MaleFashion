const mongoose = require("mongoose")
const { Schema } = mongoose

const Product_offer_Schema = new mongoose.Schema({
    Product_id: {
        type: Schema.Types.ObjectId,
        ref: "Product_image",
        required: true,
    },
    offer_percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    start_date: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value >= new Date().setHours(0, 0, 0, 0) // Check if start_date is today or in the future
            },
            message: "Start date must be today or in the future.",
        },
    },
    end_date: {
        type: Date,
        required: true,
        validate: {
            validator: function (value) {
                return value >= this.start_date // Check if end_date is after or the same as start_date
            },
            message: "End date must be after or the same as the start date.",
        },
    },
    offer_description: {
        type: String,
        required: true,
    },
})

const Product_offer = mongoose.model("Product_offer", Product_offer_Schema)
module.exports = Product_offer
