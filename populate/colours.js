const mongoose = require("mongoose")
const Colour = require("../models/colorSchema")

async function insertColours() {
    await mongoose.connect("mongodb://localhost:27017/menshop")

    const colours = [
        { Colour_name: "Red" },
        { Colour_name: "Blue" },
        { Colour_name: "Green" },
        { Colour_name: "Yellow" },
        { Colour_name: "Black" },
        { Colour_name: "White" },
        { Colour_name: "Purple" },
        { Colour_name: "Orange" },
        { Colour_name: "Pink" },
        { Colour_name: "Brown" },
        { Colour_name: "Gray" },
        { Colour_name: "Navy" },
        { Colour_name: "Teal" },
        { Colour_name: "Maroon" },
        { Colour_name: "Gold" },
        { Colour_name: "Silver" },
        { Colour_name: "Lime" },
        { Colour_name: "Olive" },
        { Colour_name: "Cyan" },
        { Colour_name: "Magenta" },
        { Colour_name: "Ivory" },
        { Colour_name: "Turquoise" },
        { Colour_name: "Violet" },
        { Colour_name: "Beige" },
        { Colour_name: "Coral" },
    ]

    await Colour.insertMany(colours)

    console.log("Colours inserted")

    mongoose.connection.close()
}

insertColours().catch((err) => console.error(err))
