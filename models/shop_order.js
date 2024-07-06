const mongoose = require("mongoose")



const { Schema, ObjectId } = mongoose

const Shop_orderSchema = new Schema({
    User_id: { type: Schema.Types.ObjectId },
    Payment_method_id: { type: Schema.Types.ObjectId },
    Order_date: { type: Date },
    Shipping_method: { type: Schema.Types.ObjectId },
    Order_number: { type: String },
    Product_cost: { type: Number },
    Coupon_discount: { type: Number },
    Coupon_code: { type: String },
    Sales_discount: { type: Number },
    Order_total: { type: Number },
    Order_status: { type: Schema.Types.ObjectId },
    Shipping_address: {
        FirstName: { type: String, required: true },
        LastName: { type: String, required: true },
        House_number: { type: String, required: true },
        Address_line_1: { type: String, required: true },
        Address_line_2: { type: String },
        Postal_code: { type: String, required: true },
        State: { type: String, required: true },
        // City: { type: String, required: true },
        // Country_id: { type: Schema.Types.ObjectId },
        Country: { type: String, required: true },
    },
    Billing_address: {
        FirstName: { type: String, required: true },
        LastName: { type: String, required: true },
        House_number: { type: String, required: true },
        Address_line_1: { type: String, required: true },
        Address_line_2: { type: String },
        Postal_code: { type: String, required: true },
        State: { type: String, required: true },
        // City: { type: String, required: true },
        // Country_id: { type: Schema.Types.ObjectId },
        Country: { type: String, required: true },
    },
})

const Shop_order = mongoose.model("Shop_order", Shop_orderSchema)

module.exports= Shop_order
