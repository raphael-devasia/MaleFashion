    const mongoose = require("mongoose")

    const { Schema, ObjectId } = mongoose

    const Order_lineSchema = new Schema({
        Product_item_id: [{ type: Schema.Types.ObjectId, ref: "Product_item" }],
        Product_name: [{ type: String }],
        Price: [{ type: Number }],
        Offer_percentage: [{ type: Number }],

        Order_id: { type: Schema.Types.ObjectId },
        Qty: [{ type: Number }],
        Status: [{ type: String }],
        Coupon_percentage: [{ type: Number }],
    })

    const Order_line = mongoose.model("Order_line", Order_lineSchema)

    module.exports =Order_line
