const productVariation = await ProductImage.find().populate({
    path: "Product_variation_id",
    populate: [
        {
            path: "Product_item_id",
            model: "Product_item",
            populate: {
                path: "Product_id",
                model: "Product",
                populate: {
                    path: "product_category_id",
                    model: "ProductCategory",
                },
            },
        },
        {
            path: "Size_id",
            model: "SizeOption",
        },
    ],
})
module.exports = productVariation