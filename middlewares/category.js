const getAllCategories = async (req, res) => {
    try {
        const categories = await ProductCategory.find({ is_deleted: false })
        res.render("categories", { data: categories })
    } catch (error) {
        res.status(500).send({ error: error.message })
    }
}
module.exports = getAllCategories