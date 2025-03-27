const { body } = require("express-validator")

const productValidationRules = () => [
    body("product_name")
        .not()
        .isEmpty()
        .withMessage("Product name is required"),
    body("category_name")
        .not()
        .isEmpty()
        .withMessage("Category name is required"),
    body("price")
        .isFloat({ min: 0 })
        .withMessage("Price must be a positive number"),
    body("Qty_in_stock")
        .isInt({ min: 0 })
        .withMessage("Quantity must be a non-negative integer"),
    body("SKU").not().isEmpty().withMessage("SKU is required"),
]

const categoryValidationRules = () => [
    body("category_name")
        .not()
        .isEmpty()
        .withMessage("Category name is required"),
    body("category_description")
        .not()
        .isEmpty()
        .withMessage("Category description is required"),
]

module.exports = { productValidationRules, categoryValidationRules }
