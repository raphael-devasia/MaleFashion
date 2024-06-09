const mongoose = require("mongoose")
const SizeCategory = require("../models/sizeCategorySchema")
const SizeOption = require("../models/sizeSchema")

async function insertSizeOptions() {
    await mongoose.connect("mongodb://localhost:27017/menshop")

    const shoeCategory = await SizeCategory.findOne({ Category_name: "Shoes" })
    const clothingCategory = await SizeCategory.findOne({
        Category_name: "Clothing",
    })
    console.log(shoeCategory)

    const shoeSizes = [
        { Sort_order: "1", Size_name: "6", Size_category_id: shoeCategory._id },
        { Sort_order: "2", Size_name: "7", Size_category_id: shoeCategory._id },
        { Sort_order: "3", Size_name: "8", Size_category_id: shoeCategory._id },
        { Sort_order: "4", Size_name: "9", Size_category_id: shoeCategory._id },
        {
            Sort_order: "5",
            Size_name: "10",
            Size_category_id: shoeCategory._id,
        },
    ]

    const clothingSizes = [
        {
            Sort_order: "1",
            Size_name: "S",
            Size_category_id: clothingCategory._id,
        },
        {
            Sort_order: "2",
            Size_name: "M",
            Size_category_id: clothingCategory._id,
        },
        {
            Sort_order: "3",
            Size_name: "L",
            Size_category_id: clothingCategory._id,
        },
        {
            Sort_order: "4",
            Size_name: "XL",
            Size_category_id: clothingCategory._id,
        },
        {
            Sort_order: "5",
            Size_name: "XXL",
            Size_category_id: clothingCategory._id,
        },
    ]

    await SizeOption.insertMany(shoeSizes)
    await SizeOption.insertMany(clothingSizes)

    console.log("Size options inserted")

    mongoose.connection.close()
}

insertSizeOptions().catch((err) => console.error(err))
