const mongoose = require("mongoose")

const { Schema,  } = mongoose

const AddressSchema = new Schema({
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
})

const Address = mongoose.model("Address", AddressSchema)

module.exports = Address
