const mongoose = require("mongoose")

const Payment_typeSchema = new mongoose.Schema({
    Value: { type: String },
})

const Payment_type = mongoose.model("Payment_type", Payment_typeSchema)

module.exports = Payment_type
