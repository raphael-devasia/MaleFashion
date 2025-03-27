const ProductService = require("../../services/productService")
const OrderService = require("../../services/orderService")
const CategoryService = require("../../services/categoryService")
const CouponService = require("../../services/couponService")
const DiscountService = require("../../services/discountService")
const DashboardService = require("../../services/dashboardService")
const { fetchSingleProduct } = require("../../utils/database")
const { uploadToS3, deleteFromS3 } = require("../../utils/s3")
const ProductImage = require("../../models/productImage")
const HttpStatus = require("../../utils/httpStatus")
const { ObjectId } = require("mongodb")

// <=======> PRODUCT CONTROLLERS  <=========>


    // RENDER THE FILES 
const getProducts = async (req, res) => {
    try {
        const products = await ProductService.getAllProducts() // Fixed typo
        res.status(HttpStatus.OK).render("productlist", {
            data: products,
            msg: { error: req.flash("error"), success: req.flash("success") }, // Structured object
        })
    } catch (error) {
        // Set flash message for the next request
        req.flash("error", "Unable to load products. Please try again later.")

        // Render with empty data and current flash messages (if any from previous requests)
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).render("productlist", {
            data: [],
            msg: { error: req.flash("error"), success: req.flash("success") },
        })
    }
}

const addProduct = async (req, res) => {
    try {
        const { categories, sizeOptions, colourOptions } =
            await ProductService.getAddProductData()

        // Render the add product form
        res.status(HttpStatus.OK).render("addproduct", {
            categories,
            sizeOptions,
            colourOptions,
            product: [], // Empty unless you need existing products here
            msg: { error: req.flash("error"), success: req.flash("success") },
        })
    } catch (error) {
        console.error("Error loading add product form:", error)

        // Set a user-friendly flash message
        req.flash(
            "error",
            "Unable to load the add product form. Please try again later."
        )

        // Render with empty data to avoid breaking the page
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).render("addproduct", {
            categories: [],
            sizeOptions: [],
            colourOptions: [],
            product: [],
            msg: { error: req.flash("error"), success: req.flash("success") },
        })
    }
}

const getSingleProduct = async (req, res) => {
    try {
        const productId = req.params.id

        const product = await ProductService.getProductById(productId)

        // Since getProductById returns an array, check length
        if (!product || product.length === 0) {
            req.flash("error", "Product not found")
            return res.status(HttpStatus.NOT_FOUND).redirect("/admin/products")
        }

        // Render with the array as-is
        res.status(HttpStatus.OK).render("singleproduct", {
            data: product, // Array with one item
            msg: { error: req.flash("error"), success: req.flash("success") },
        })
    } catch (error) {
        console.error("Error fetching single product:", error.message || error)
        req.flash(
            "error",
            error.message ||
                "Unable to load product details. Please try again later."
        )
        res.status(
            error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR
        ).redirect("/admin/products")
    }
}

const editProduct = async (req, res) => {
    try {
        const productId = req.params.id
        
        // Validate ObjectId
        if (!ObjectId.isValid(productId)) {
            req.flash("error", "Invalid product ID")
            return res.redirect("/admin/products")
        }

        const { categories, sizeOptions, colourOptions } =
            await ProductService.getAddProductData()
        const product = await ProductService.getProductById(productId)

        if (!product || product.length === 0) {
            req.flash("error", "Product not found")
            return res.redirect("/admin/products")
        }

        res.render("editproduct", {
            categories,
            sizeOptions,
            colourOptions,
            data: product,
            msg: req.flash("info"),
        })
    } catch (error) {
        console.error("Error in editProduct:", error)
        req.flash("error", "Failed to load product for editing")
        res.redirect("/admin/products")
    }
}

    // CRUD OPERATIONS

const updateProduct = async (req, res) => {
    try {
        const {
            productImageId,
            product_name,
            Colour_name,
            size,
            deletedImages,
            ...otherData
        } = req.body
        const parsedDeletedImages = deletedImages
            ? JSON.parse(deletedImages)
            : []
        

        // Fetch current images
        const productImage = await ProductImage.findById(productImageId)
        if (!productImage) {
            req.flash("error", "Product image not found")
            return res.status(HttpStatus.NOT_FOUND).redirect("/admin/products")
        }

        let currentImages = productImage ? productImage.Image_filename : []

        // Handle deletions
        if (parsedDeletedImages.length > 0) {
            await Promise.all(
                parsedDeletedImages.map(async (imageUrl) => {
                    const key = imageUrl.split("/").pop()
                    await deleteFromS3(key)
                })
            )
            currentImages = currentImages.filter(
                (url) => !parsedDeletedImages.includes(url)
            )
        }

        // Handle uploads
        let newImages = []
        if (req.files && req.files["product_images[]"]) {
            const files = Array.isArray(req.files["product_images[]"])
                ? req.files["product_images[]"]
                : [req.files["product_images[]"]]
            newImages = await Promise.all(
                files.map(async (file, index) => {
                    const fileName = `${Date.now()}-${index}-${file.name}`
                    const s3Key = `products/${fileName}`
                    return await uploadToS3(file, s3Key)
                })
            )
        }

        // Combine images and validate count
        const updatedImages = [...currentImages, ...newImages]
        if (updatedImages.length < 3 || updatedImages.length > 5) {
            

            req.flash("error", "Product must have between 3 and 5 images.")
            return res
                .status(HttpStatus.BAD_REQUEST)
                .redirect(`/admin/editproduct/${productImageId}`)
        }

        // Update product via service
        await ProductService.updateProduct(productImageId, {
            product_name,
            Colour_name,
            size,
            ...otherData,
            images: updatedImages,
        })

       res.status(HttpStatus.OK).redirect("/admin/products")
    } catch (error) {
        console.error("Error updating product:", error.message)
       req.flash(
           "error",
           error.message || "Failed to update product. Please try again."
       )
       res.status(HttpStatus.INTERNAL_SERVER_ERROR).redirect(
           `/admin/editproduct/${productImageId}`
       )
    }
}
const createNewProduct = async (req, res) => {
    const {
        productType,
        product_id, // For variant case
        category_name,
        product_name,
        product_description,
        size,
        Colour_name,
        SKU,
        Qty_in_stock,
        price,
    } = req.body

    try {
        // Check if the product variation already exists
        const productExists = await ProductService.checkExistingVariation(
            product_name,
            Colour_name,
            size
        )
        console.log("Variation exists:", productExists)
        if (productExists) {
            
            req.flash("info", "Product Variant Exists in Database")
            return res.redirect("/admin/addproduct")
        }

        console.log("Product variant does not exist")

        // Handle image uploads to S3
        const images = req.files["product_images[]"]
        if (!images || images.length === 0) {
            throw new Error("No images uploaded")
        }

        const uploadPromises = images.map(async (image, index) => {
            const fileName = `${Date.now()}-${index}-${image.name}`
            const s3Key = `products/${fileName}`
            const imageUrl = await uploadToS3(image, s3Key)
            return imageUrl // Return just the URL
        })

        const imageFilenames = await Promise.all(uploadPromises)

        // Prepare data for ProductService
        const productData = {
            productType,
            product_id, // For variant case
            category_name,
            product_name,
            product_description,
            size,
            Colour_name,
            SKU,
            Qty_in_stock,
            price,
            images: imageFilenames, // Array of S3 URLs
        }

        // Use ProductService to create the product or variant
        await ProductService.createProduct(productData)

        // Redirect to products page after successful creation
        return res.redirect("/admin/products")
    } catch (err) {
        console.error("Error creating new product:", err.message)
        req.flash("error", "Failed to create product")
        return res.redirect("/admin/addproduct")
    }
}
const deleteProduct = async (req, res) => {
    try {
        await ProductService.deleteProduct(req.params.id)
        res.status(200).json({ message: "Product deleted successfully" })
    } catch (error) {
        throw error
    }
}

const deleteImage = async (req, res) => {
    try {
        const { image, productId } = req.body
        const newImageList = await ProductService.deleteImage(productId, image)
        res.status(200).json({
            success: true,
            message: "Image removed successfully",
            newImageList,
        })
    } catch (error) {
        throw error
    }
}
// <=======> CATEGORY CONTROLLERS  <=========>
const getCategories = async (req, res) => {
    try {
        const categories = await CategoryService.getAllCategories()
        res.render("categorylist", { data: categories })
    } catch (error) {
        throw error
    }
}

const editCategory = async (req, res) => {
    try {
        const category = await CategoryService.getCategoryById(req.params.id)
        const { size_category } = await CategoryService.getAddCategoryData()

        res.render("editcategory", {
            data: category,
            size_category: size_category,
        })
    } catch (error) {
        console.error("Error in editCategory:", error)
        res.status(500).render("error", {
            message: "Failed to load category edit page",
        })
    }
}

const addCategory = async (req, res) => {
    try {
        const { size_category } = await CategoryService.getAddCategoryData()
        res.render("addcategory", { size_category, msg: req.flash("info") })
    } catch (error) {
        throw error
    }
}

const addNewCategory = async (req, res) => {
    try {
        const image = req.files?.category_image
        let imageUrl = null

        if (image) {
            const s3Key = `category/${Date.now()}_${image.name}`
            imageUrl = await uploadToS3(image, s3Key)
        }

        await CategoryService.addCategory(req.body, imageUrl)
        req.flash("success", "Category added successfully")
        res.status(201).redirect("/admin/addcategory")
    } catch (error) {
        console.log(error)

        req.flash("error", error.message)
        res.redirect("/admin/addcategory")
    }
}

const updateCategory = async (req, res) => {
    try {
        const image = req.files?.category_image
        let imageUrl = null

        if (image) {
            const s3Key = `category/${Date.now()}_${image.name}`
            imageUrl = await uploadToS3(image, s3Key)
        }

        await CategoryService.updateCategory(req.params.id, req.body, imageUrl)
        req.flash("success", "Category updated successfully")
        res.status(201).redirect("/admin/categories")
    } catch (error) {
        console.error("Error in updateCategory:", error)
        // res.status(500).json({ message: "Failed to update category" })
        req.flash("error", "Failed to update category")
        res.redirect("/admin/editcategory/" + req.params.id)
    }
}

const deleteCategory = async (req, res) => {
    try {
        await CategoryService.deleteCategory(req.params.id)
        req.flash("success", "Category Deleted successfully")
        res.redirect("/admin/categories")
    } catch (error) {
        req.flash("error", "Failed to delete category")
        res.redirect("/admin/categories")
    }
}

// <=======> SALES CONTROLLERS  <=========>

const getSales = async (req, res) => {
    try {
        const orders = await OrderService.getAllOrders()
        res.render("saleslist", { OrderDetails: orders })
    } catch (error) {
        throw error
    }
}

const getSaleDetails = async (req, res) => {
    try {
        const orderDetails = await OrderService.getOrderDetails(req.params.id)
        const lengthOfProducts = orderDetails.Product_item_id.length
        const productArray = []
        for (let i = 0; i < lengthOfProducts; i++) {
            const data = {
                Product_item: await fetchSingleProduct(
                    orderDetails.Product_item_id[i]
                ),
                Price: orderDetails.Price[i],
                Qty: orderDetails.Qty[i],
            }
            productArray.push(data)
        }
        res.render("sales-details", { orderDetails, productArray })
    } catch (error) {
        throw error
    }
}

const deleteOrder = async (req, res) => {
    try {
        await OrderService.cancelOrder(req.params.id)
        res.status(200).json({ message: "Successfully Cancelled The order" })
    } catch (error) {
        throw error
    }
}
const cancelItem = async (req, res) => {
    try {
        await OrderService.cancelItem(req.query.orderId, req.params.id)
        res.redirect(`/admin/sales/saledetails/${req.query.orderId}`)
    } catch (error) {
        throw error
    }
}
const updateOrder = async (req, res) => {
    try {
        const { id, status } = req.query
        await OrderService.updateOrderStatus(id, status)
        res.status(200).send("Status updated successfully")
    } catch (error) {
        throw error
    }
}



const shipItem = async (req, res) => {
    try {
        await OrderService.shipItem(req.query.orderId, req.params.id)
        res.redirect(`/admin/sales/saledetails/${req.query.orderId}`)
    } catch (error) {
        throw error
    }
}

const refundItem = async (req, res) => {
    try {
        await OrderService.refundItem(req.query.orderId, req.params.id)
        res.redirect(`/admin/sales/saledetails/${req.query.orderId}`)
    } catch (error) {
        throw error
    }
}
// <=======> COUPON CONTROLLERS  <=========>
const getAddCoupon = async (req, res) => {
    res.render("addcoupon")
}

const postAddCoupon = async (req, res) => {
    try {
        if (new Date(req.body.start_date) < new Date().setHours(0, 0, 0, 0))
            throw new AppError("Start date cannot be in the past", 400)
        if (new Date(req.body.end_date) < new Date(req.body.start_date))
            throw new AppError("End date must be after start date", 400)
        const coupon = await CouponService.createCoupon(req.body)

        res.status(201).json({ message: "Coupon created successfully", coupon })
    } catch (error) {
        throw error
    }
}

const getAllCoupons = async (req, res) => {
    try {
        const coupons = await CouponService.getAllCoupons()
        res.render("couponlist", { coupons })
    } catch (error) {
        throw error
    }
}

const deleteCoupon = async (req, res) => {
    try {
        await CouponService.deleteCoupon(req.params.id)
        res.status(200).json({ message: "Coupon deleted successfully" })
    } catch (error) {
        throw error
    }
}
// <=======> PRODUCT OFFER CONTROLLERS  <=========>
const getProductDiscount = async (req, res) => {
    try {
        const products = await DiscountService.getProductDiscounts()
        res.render("add-product-discount", { data: products })
    } catch (error) {
        throw error
    }
}

const getCategoryDiscount = async (req, res) => {
    try {
        const categories = await DiscountService.getCategoryDiscounts()
        res.render("add-category-discount", { categories })
    } catch (error) {
        throw error
    }
}

const getProductDiscountList = async (req, res) => {
    try {
        const offers = await DiscountService.getProductDiscountList()
        res.render("productofferlist", { offers })
    } catch (error) {
        throw error
    }
}

const getCategoryDiscountList = async (req, res) => {
    try {
        const offers = await DiscountService.getCategoryDiscountList()
        res.render("category-offer-list", { offers })
    } catch (error) {
        throw error
    }
}

const addProductDiscount = async (req, res) => {
    try {
        if (new Date(req.body.start_date) < new Date().setHours(0, 0, 0, 0))
            throw new AppError("Start date cannot be in the past", 400)
        if (new Date(req.body.end_date) < new Date(req.body.start_date))
            throw new AppError("End date must be after start date", 400)
        const offer = await DiscountService.addProductDiscount(req.body)
        res.status(201).json({
            message: "Offer created successfully",
            coupon: offer,
        })
    } catch (error) {
        throw error
    }
}

const addCategoryDiscount = async (req, res) => {
    try {
        if (new Date(req.body.start_date) < new Date().setHours(0, 0, 0, 0))
            throw new AppError("Start date cannot be in the past", 400)
        if (new Date(req.body.end_date) < new Date(req.body.start_date))
            throw new AppError("End date must be after start date", 400)
        const offer = await DiscountService.addCategoryDiscount(req.body)
        res.status(201).json({
            message: "Offer created successfully",
            coupon: offer,
        })
    } catch (error) {
        throw error
    }
}

const deleteCategoryOffer = async (req, res) => {
    try {
        await DiscountService.deleteCategoryOffer(req.params.id)
        res.status(200).json({ message: "Coupon deleted successfully" })
    } catch (error) {
        throw error
    }
}
const deleteProductOffer = async (req, res) => {
    try {
        await DiscountService.deleteProductOffer(req.params.id)
        res.status(200).json({ message: "Offer deleted successfully" })
    } catch (error) {
        throw error
    }
}

// <=======> HOME && REPORTS <=========>
const getSalesReport = async (req, res) => {
    try {
        const {
            productDetails,
            totalRevenue,
            totalDiscount,
            couponDiscount,
            averageOrderValue,
        } = await DashboardService.getSalesReport()
        res.render("salesreport", {
            productDetails,
            totalRevenue,
            totalDiscount,
            couponDiscount,
            averageOrderValue,
        })
    } catch (error) {
        throw error
    }
}

const getHome = async (req, res) => {
    try {
        const { bestProducts, sortedCategoryStats, totalQty, totalPrice } =
            await DashboardService.getHomeData()
        const chartData = await DashboardService.getChartData("daily") // Default to daily
        res.render("index", {
            bestProducts,
            sortedCategoryStats,
            totalQty,
            totalPrice,
            ...chartData,
        })
    } catch (error) {
        throw error
    }
}

const getChartData = async (req, res) => {
    try {
        const chartData = await DashboardService.getChartData(
            req.query.interval || "daily"
        )
        res.json(chartData)
    } catch (error) {
        throw error
    }
}

// Placeholder brand routes (minimal implementation)
const addBrand = (req, res) => res.render("addbrand")
const editBrand = (req, res) => res.render("editbrand")
const getBrands = (req, res) => res.render("brandlist")

module.exports = {
    getProducts,
    addProduct,
    getSingleProduct,
    editProduct,
    
    updateProduct,
    createNewProduct,
    deleteProduct,
    deleteImage,
    getCategories,
    editCategory,
    addCategory,
    addNewCategory,
    updateCategory,
    deleteCategory,
    addBrand,
    editBrand,
    getBrands,
    getSales,
    getSaleDetails,
    deleteOrder,
    updateOrder,
    cancelItem,
    shipItem,
    refundItem,
    getAddCoupon,
    postAddCoupon,
    getAllCoupons,
    deleteCoupon,
    getProductDiscount,
    getCategoryDiscount,
    getProductDiscountList,
    getCategoryDiscountList,
    addProductDiscount,
    addCategoryDiscount,
    deleteCategoryOffer,
    getSalesReport,
    getHome,
    getChartData,
    deleteProductOffer,
}
