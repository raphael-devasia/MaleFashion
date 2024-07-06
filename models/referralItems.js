const mongoose = require("mongoose")
const { Schema } = mongoose

const Referral_items_Schema = new mongoose.Schema(
    {
        Referral_Amount: { type: Number },
        Status: { type: String },
        Referred_by: { type: Schema.Types.ObjectId, ref: "User" },
        Refferals_ids: { type: Schema.Types.ObjectId, ref: "User" },
        Wallet_id: { type: Schema.Types.ObjectId, ref: "Wallet" },
    },
    { timestamps:true }
)

const Referral_items = mongoose.model("Referral_items", Referral_items_Schema)
module.exports = Referral_items
