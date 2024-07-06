const mongoose = require("mongoose")
const { Schema } = mongoose

const Wallet_Schema = new mongoose.Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    Wallet_amount: { type: Number },
   

    
})

const Wallet = mongoose.model("Wallet", Wallet_Schema)
module.exports = Wallet
