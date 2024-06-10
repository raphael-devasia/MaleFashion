const path = require('path')
const collection = require("../../models/adminSchema")
const userCollection = require("../../models/schema")
const SizeOption = require("../../models/sizeSchema")
const ProductCategory = require("../../models/productSchema")
const Size_category = require("../../models/sizeCategorySchema")
const Product = require("../../models/products")
const ProductItem = require("../../models/product_item")
const ProductVariation = require("../../models/productVariation")
const ProductImage = require('../../models/productImage')
const Colours = require("../../models/colorSchema")
const { log } = require('console')
const { populate } = require('../../models/googleUser')
const sharp = require("sharp")
const mongoose = require("mongoose")



// Get Products route
const getProducts = async (req, res) => {
    const isAdmin = true

    try {

const productVariation = await ProductImage.find({Is_active:true}).populate({
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
    
           return res.render("productlist", { data: productVariation }) 
        
    } catch (error) {
        console.log(error);
    }
    

}

// Update Product POST
 const updateProduct = async (req, res) => {
     try {
         const id = req.body.id
         console.log(id)

         const {
             product_name,
             category_name,
             size,
             Colour_name,
             SKU,
             Qty_in_stock,
             product_description,
             price,
         } = req.body

         // Resolve the category, size, and color IDs
         const categoryDoc = await ProductCategory.findOne({
             category_name: category_name,
         })

         const sizeDoc = await SizeOption.findOne({ Size_name: size })
         const colourDoc = await Colours.findOne({ Colour_name: Colour_name })
         console.log("Query Results:", { categoryDoc, sizeDoc, colourDoc })
         
         // Construct the update object
         const update = {
             $set: {
                 "product.name": product_name,
                 "product.qty_in_stock": Qty_in_stock,
                 "product.description": product_description,
                 "product.price": price,
             },
         }

         // Check if categoryDoc, sizeDoc, and colourDoc are not null before accessing their properties
         if (categoryDoc) {
             update.$set["product.category_id"] = categoryDoc._id
         }
         if (sizeDoc) {
             update.$set["product_item.size_id"] = sizeDoc._id
         }
         if (colourDoc) {
             update.$set["product_item.colour_id"] = colourDoc._id
         }


         console.log("enetrring next step")
         console.log("STEP2:", update)
         // Define the array filters (though it's not clear what e1 and e2 are in this context)
         // Assuming these filters are needed for nested updates; adjust as needed.
         const arrayFilters = [
             { "e1.name": req.params.model },
             { "e2._id": req.params._id },
         ]

         // Perform the update
         const result = await ProductImage.findOneAndUpdate(
             { _id: new mongoose.Types.ObjectId(id) },
             update,
             { arrayFilters, new: true }
         )

         if (!result) {
             return res.status(404).json({ message: "Product not found" })
         }

         res.json({ message: "Product updated successfully", result })
     } catch (error) {
         console.error("Error updating product:", error)
         res.status(500).json({ message: "Internal Server Error" })
     }
 }

// Get Add Products route
const addProduct = async (req, res) => {
    const isAdmin = true
    try {
      
       // Aggregate product data
      const product = await ProductImage.aggregate([
          {
              $lookup: {
                  from: "product_variations",
                  localField: "Product_variation_id",
                  foreignField: "_id",
                  as: "Product_variation",
              },
          },
          { $unwind: "$Product_variation" },
          {
              $lookup: {
                  from: "product_items",
                  localField: "Product_variation.Product_item_id",
                  foreignField: "_id",
                  as: "Product_item",
              },
          },
          { $unwind: "$Product_item" },
          {
              $lookup: {
                  from: "products",
                  localField: "Product_item.Product_id",
                  foreignField: "_id",
                  as: "Product",
              },
          },
          { $unwind: "$Product" },
          {
              $group: {
            _id: "$Product.product_name",
            Product_description: { $first: "$Product.product_description" },
            Product_variation_ids: { $addToSet: "$Product_variation_id" }
          },
    }])

        // Fetch categories, size options, and color options
        const categories = await ProductCategory.find()
            .populate("size_category")
            .exec()
        const sizeOptions = await SizeOption.find()
        const colourOptions = await Colours.find()
        const msg = req.flash('info')
        

        // Render the addproduct page with the fetched data
        res.render("addproduct", {
            categories,
            sizeOptions,
            colourOptions,
            product, // Add aggregated product data to the rendering context
            msg:msg
        })
    } catch (error) {
        res.redirect("/admin/login")
    }
}

// Get Single Product route
const getSingleProduct = async (req, res) => {
    const isAdmin = true
    const id = req.params.id
    
   

     
           const singleProduct = await ProductImage.aggregate([
               {
                   $lookup: {
                       from: "product_variations",
                       localField: "Product_variation_id",
                       foreignField: "_id",
                       as: "product_variation",
                   },
               },
               {
                   $unwind: "$product_variation",
               },
               {
                   $lookup: {
                       from: "product_items",
                       localField: "product_variation.Product_item_id",
                       foreignField: "_id",
                       as: "product_item",
                   },
               },
               {
                   $unwind: "$product_item",
               },
               {
                   $lookup: {
                       from: "products",
                       localField: "product_item.Product_id",
                       foreignField: "_id",
                       as: "product",
                   },
               },
               {
                   $unwind: "$product",
               },
               {
                   $lookup: {
                       from: "productcategories",
                       localField: "product.product_category_id",
                       foreignField: "_id",
                       as: "category",
                   },
               },
               {
                   $unwind: "$category",
               },
               {
                   $lookup: {
                       from: "colours",
                       localField: "product_item.Colour_id",
                       foreignField: "_id",
                       as: "colour",
                   },
               },
               {
                   $unwind: "$colour",
               },
               {
                   $lookup: {
                       from: "sizeoptions",
                       localField: "product_variation.Size_id",
                       foreignField: "_id",
                       as: "size_option",
                   },
               },
               {
                   $unwind: "$size_option",
               },
               {
                   $match: {
                       _id: new mongoose.Types.ObjectId(id), // No need to create a new ObjectId instance
                   },
               },
           ])
              
        
     
    console.log(singleProduct);
    
res.render("singleproduct", {data: singleProduct })
}

// Get Edit Product route
const editProduct = async (req, res) => {
    const isAdmin = true
    const id= req.params.id
    let singleProduct;
    if (req.session.admin) {
        
       


    try {
        // Fetch categories, size options, and color options
        const categories = await ProductCategory.find()
            .populate("size_category")
            .exec()
        const sizeOptions = await SizeOption.find()
        const colourOptions = await Colours.find()
        
        //
        singleProduct = await ProductImage.aggregate([
            {
                $lookup: {
                    from: "product_variations",
                    localField: "Product_variation_id",
                    foreignField: "_id",
                    as: "product_variation",
                },
            },
            {
                $unwind: "$product_variation",
            },
            {
                $lookup: {
                    from: "product_items",
                    localField: "product_variation.Product_item_id",
                    foreignField: "_id",
                    as: "product_item",
                },
            },
            {
                $unwind: "$product_item",
            },
            {
                $lookup: {
                    from: "products",
                    localField: "product_item.Product_id",
                    foreignField: "_id",
                    as: "product",
                },
            },
            {
                $unwind: "$product",
            },
            {
                $lookup: {
                    from: "productcategories",
                    localField: "product.product_category_id",
                    foreignField: "_id",
                    as: "category",
                },
            },
            {
                $unwind: "$category",
            },
            {
                $lookup: {
                    from: "colours",
                    localField: "product_item.Colour_id",
                    foreignField: "_id",
                    as: "colour",
                },
            },
            {
                $unwind: "$colour",
            },
            {
                $lookup: {
                    from: "sizeoptions",
                    localField: "product_variation.Size_id",
                    foreignField: "_id",
                    as: "size_option",
                },
            },
            {
                $unwind: "$size_option",
            },
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(id), // No need to create a new ObjectId instance
                },
            },
        ])
       

        return res.render("editproduct", {
            categories,
            sizeOptions,
            colourOptions,
            data: singleProduct,
        })
    }
     catch (err) {
        console.log("an error");
    }
        
    }

    res.redirect("/admin/login")
}
// Get Categories
const getCategories = async (req, res) => {
    const isAdmin = true
    
    if (req.session.admin) {
        const categories = await ProductCategory.find({ is_deleted: false })

        return res.render("categorylist", {data: categories})
    }

    res.redirect("/admin/login")
}


// EditCategories
const editCategory = async (req, res) => {
    const isAdmin = true
    const id = req.params.id
    
    if (req.session.admin) {
        const categories = await ProductCategory.findById(id)
        
        const sizecategory = await Size_category.findById(categories.size_category._id)
       
        

        return res.render("editcategory", {
            data: categories,
            size: sizecategory,
        })
    }

    res.redirect("/admin/login")
}
// EditCategories 
const addCategory = async (req, res) => {
    const isAdmin = true
    if (req.session.admin) {
        const userDetails = await userCollection.find()

        return res.render("addcategory")
    }

    res.redirect("/admin/login")
}
// Update Category 
const updateCategory = async (req, res) => {
    const categoryId = req.params.id
    const { category_name, Category_name, category_description } = req.body
   
    const image = req.files ? req.files.category_image : null

    try {
        // Check if the category exists
        let existingCategory = await ProductCategory.findById(categoryId)
        
        if (!existingCategory) {
            return res.status(404).json({ error: "Category not found" })
        }

        // Update the category fields
        existingCategory.category_name = category_name
        existingCategory.category_description = category_description

        // Check if the size category is provided and update if necessary
        if (Category_name) {
            // Check if the size category exists
            var existingSizeCategory = await Size_category.findById(
                existingCategory.size_category
                
            )
            console.log(existingSizeCategory)
            if (!existingSizeCategory) {
                return res
                    .status(404)
                    .json({ error: "Size category not found" })
            }
            existingSizeCategory.Category_name = Category_name
        }

        // Check if image is provided and update if necessary
        if (image) {
            // Ensure that req.files.category_image is an image file
            if (!image.mimetype.startsWith("image/")) {
                return res
                    .status(400)
                    .json({ error: "Please upload an image file" })
            }

            // Move the uploaded file to the defined directory
            const uploadDirectory = path.join(
                __dirname,
                "../../public/assets/img/category"
            )
            await image.mv(path.join(uploadDirectory, image.name))
            existingCategory.category_image =
                "/assets/img/category/" + image.name
        }

        // Save the updated category
        await existingCategory.save()
        await existingSizeCategory.save()

        res.status(200).json({ message: "Category updated successfully" })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

// Create a Category
const addNewCategory = async (req, res) => {
    const image = req.files.category_image

    // Ensure that req.files.category_image exists and is an image file
    if (!image || !image.mimetype.startsWith("image/")) {
        return res.status(400).json({ error: "Please upload an image file" })
    }
     const category_image = "/assets/img/category/" + image.name
   
    
    const { category_name, size_category, category_description } = req.body

    try {
        const uploadDirectory = path.join(
            __dirname,
            "../../public/assets/img/category"
        )
        // Move the uploaded file to the defined directory
        await image.mv(path.join(uploadDirectory, image.name))

        const newSizeCategory = await Size_category.create({
            Category_name: size_category,
        })

        const newCategory = await ProductCategory.create({
            category_name,
            category_description,
            category_image,
            size_category: newSizeCategory._id,
        })

        res.status(201).redirect('/admin/addcategory')
    } catch (err) {
       
        res.status(400).send({ error: err.message })
    }
}

// Add Brand
const addBrand = async (req, res) => {
    const isAdmin = true
    if (req.session.admin) {
        const userDetails = await userCollection.find()

        return res.render("addbrand")
    }

    res.redirect("/admin/login")
}
// Delete category
const deleteCategory= async (req,res)=>{
    const isAdmin = true
    const { id } = req.params
   

        try {
            await ProductCategory.findByIdAndUpdate(id, { is_deleted: true })
            res.status(200).json({ message: "Category deleted successfully" })
        } catch (error) {
            res.status(500).json({
                error: "An error occurred while deleting the category",
            })
        }
    }


// Get Brands
const getBrands = async (req, res) => {
    const isAdmin = true
    if (req.session.admin) {
        const userDetails = await userCollection.find()

        return res.render("brandlist")
    }

    res.redirect("/admin/login")
}
// Edit Brands
const editBrand = async (req, res) => {
    const isAdmin = true
    if (req.session.admin) {
        const userDetails = await userCollection.find()

        return res.render("editbrand")
    }

    res.redirect("/admin/login")
}

/////create new product
const createNewProduct = async (req, res) => {
    // const images = req.files ? req.files.product_images : null
    // const imageFilenames = []
    // if (images) {
    //     const uploadDirectory = path.join(
    //         __dirname,
    //         "../../public/assets/img/product"
    //     )

    //     if (Array.isArray(images)) {
    //         for (let i = 0; i < images.length; i++) {
    //             const image = images[i]
    //             const imagePath = path.join(uploadDirectory, image.name)
    //             ////cropping
    //             await image.mv(imagePath)
    //             imageFilenames.push("/assets/img/product/" + image.name)
    //         }
    //     } else {
    //         // If a single image is uploaded
    //         const imagePath = path.join(uploadDirectory, images.name)
    //         await images.mv(imagePath)
    //         imageFilenames.push("/assets/img/product/" + images.name)
    //     }
    // }


    /////implemented product crop and resize


    const images = req.files ? req.files.product_images : null
    const imageFilenames = []

     if (images) {
        const uploadDirectory = path.join(__dirname, "../../public/assets/img/product");

        const processImage = async (image, filename) => {
            const imagePath = path.join(uploadDirectory, filename)

            // Validate image size before processing
            const { width, height } = await sharp(image.data).metadata()
            console.log("Image dimensions:", width, height)

            const extractOptions = {
                width: 400,
                height: 400,
                left: 50,
                top: 50,
            }

            if (
                width < extractOptions.left + extractOptions.width ||
                height < extractOptions.top + extractOptions.height
            ) {
                throw new Error("Extract area is out of bounds")
            }

            await sharp(image.data)
                .resize(300, 300) // Resize to 300x300 pixels
                .extract(extractOptions) // Crop to 400x400 pixels starting from (50, 50)
                .toFile(imagePath)
            return "/assets/img/product/" + filename
        }

        try {
            if (Array.isArray(images)) {
                for (let i = 0; i < images.length; i++) {
                    const image = images[i];
                    const filename = "cropped-" + image.name;
                    const croppedImagePath = await processImage(image, filename);
                    imageFilenames.push(croppedImagePath);
                }
            } else {
                // If a single image is uploaded
                const filename = "cropped-" + images.name;
                const croppedImagePath = await processImage(images, filename);
                imageFilenames.push(croppedImagePath);
            }
        } catch (error) {
            return res.status(400).send({ error: 'Image processing error: ' + error.message });
        }
    }

    const {product_id,
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
   
//  
const productExists = await ProductImage.aggregate([
    {
        $lookup: {
            from: "product_items",
            localField: "Product_item_id",
            foreignField: "_id",
            as: "product_item",
        },
    },
    {
        $unwind: "$product_item",
    },
    {
        $lookup: {
            from: "products",
            localField: "product_item.Product_id",
            foreignField: "_id",
            as: "product",
        },
    },
    {
        $unwind: "$product",
    },
    {
        $lookup: {
            from: "colours",
            localField: "product_item.Colour_id",
            foreignField: "_id",
            as: "colour",
        },
    },
    {
        $unwind: "$colour",
    },
    {
        $lookup: {
            from: "sizeoptions",
            localField: "Size_id",
            foreignField: "_id",
            as: "size_option",
        },
    },
    {
        $unwind: "$size_option",
    },
    {
        $match: {
            "product.product_name": product_name,
            "colour.Colour_name": Colour_name,
            "size_option.Size_name": size,
        },
    },
    {
        $count: "productCount",
    },
])

  
console.log(productExists)
if (productExists.length > 0 && productExists[0].productCount > 0) {
    console.log("Product already exists")
    req.flash('info',"Product Varient Exist in Database")
    res.redirect("/admin/addproduct")
} else {
    console.log("Product does not exist")
    
 const category_id = await ProductCategory.findOne({ category_name })
 const sizeOptions = await SizeOption.find({ Size_name: size })
 const colourname = await Colours.findOne({ Colour_name })

 const newProduct = await Product.create({
     product_name,
     product_description,
     product_category_id: category_id._id,
 })

 const product_items = await ProductItem.create({
     Product_id: newProduct._id,
     Colour_id: colourname._id,
     Original_price: price,
     Product_sku: SKU,
 })

 const newVariation = await ProductVariation.create({
     Product_item_id: product_items._id,
     Size_id: sizeOptions[0]._id,
     Qty_in_stock,
 })

 if (imageFilenames.length > 0) {
     await ProductImage.create({
         Product_variation_id: newVariation._id,
         Image_filename: imageFilenames,
     })
 }

 res.status(201).redirect("/admin/products")


}

       
    } catch (err) {
        res.status(400).send({ error: err.message })
    }
} 
///// DELETE PRODUCT
const deleteProduct= async (req,res)=>{
   const isAdmin = true
    const { id } = req.params
    console.log("Delete process started",id);
 

        try {
            await ProductImage.findByIdAndUpdate(id, { Is_active: false })
            res.status(200).json({ message: "Category deleted successfully" })
        } catch (error) {
            res.status(500).json({
                error: "An error occurred while deleting the category",
            })
        }  
}
   
module.exports = {
    getProducts,
    addProduct,
    getSingleProduct,
    editProduct,
    getCategories,
    editCategory,
    addCategory,
    addBrand,
    editBrand,
    getBrands,
    addNewCategory,
    updateCategory,
    deleteCategory,
    createNewProduct,
    deleteProduct,
    updateProduct,
}
