const mongoose = require("mongoose")

const { Schema, ObjectId } = mongoose

const Wishlist_schema = new Schema({
    User_id: { type: Schema.Types.ObjectId },
    Product_image_id: { type: Schema.Types.ObjectId, ref: "Product_image" },
})

const Wishlist = mongoose.model("Wishlist", Wishlist_schema)

module.exports = Wishlist
