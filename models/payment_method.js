const mongoose = require("mongoose")

const { Schema, ObjectId } = mongoose

const User_payment_methodSchema = new Schema({
    User_id: { type: Schema.Types.ObjectId },
    Payment_type_id: { type: Schema.Types.ObjectId },
    Payment_value: { type: Number },
    Expiry_date: { type: String, default: null },
    Provider: { type: String, default: null },
    Is_default: { type: Boolean, default: true },
    Account_number: { type: String },
})

const User_payment_method = mongoose.model(
    "User_payment_method",
    User_payment_methodSchema
)

module.exports= User_payment_method
