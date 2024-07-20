const mongoose = require("mongoose")

const Coupon_Schema = new mongoose.Schema({
    coupon_code: {
        type: String,
        required: true,
        match: /^[A-Z0-9]{6,}$/,
        unique: true,
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
    coupon_description: {
        type: String,
        required: true,
    },
    coupon_min: {
        type: Number,
    },
    coupon_max: {
        type: Number,
    },
})

const Coupon = mongoose.model("Coupon", Coupon_Schema)
module.exports = Coupon
