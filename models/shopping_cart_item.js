const mongoose = require("mongoose")

const { Schema, ObjectId } = mongoose

const Shopping_cart_itemSchema = new Schema({
    Product_item_id: { type: Schema.Types.ObjectId },
    Cart_id: {
        type: Schema.Types.ObjectId,
        ref: "Shopping_cart",
        default: null,
    },
    Qty: { type: Number },
    Coupon_id: { type: Schema.Types.ObjectId },
})

const Shopping_cart_item = mongoose.model(
    "Shopping_cart_item",
    Shopping_cart_itemSchema
)

module.exports= Shopping_cart_item
