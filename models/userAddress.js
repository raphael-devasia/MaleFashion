const mongoose = require("mongoose") 

const { Schema, ObjectId } = mongoose

const User_addressSchema = new Schema({
    Is_Billing_default: { type: Boolean, required: true, default: false },
    Is_Shipping_default: { type: Boolean, required: true, default: false },
    Is_Active:{ type: Boolean, required: true, default: true },
    Address_id: { type: Schema.Types.ObjectId, ref: "Address" },
})

const User_address = mongoose.model("User_address", User_addressSchema)

module.exports= User_address