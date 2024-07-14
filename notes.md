const getWishlist = async (req, res) => {
    try {
        const category = await Product_category.find()

        const user = req.session.user

        if (!user) {
            return res.status(401).json({ message: "User not logged in" })
        }

        const userdetails = await findUserByEmail(user)

        if (!userdetails) {
            return res.status(404).json({ message: "User not found" })
        }

        const existingWishList = await Wishlist.find({
            User_id: userdetails._id,
        })

              const { cartLength, totalCartAmount } = await getCartDetails(
                  req.session.user
              )
              const wishListlength = await getWishlistLength(req.session.user)

              const name = userdetails.firstName

        if (existingWishList.length < 1) {


    return res.render("user/wishlist", {
                category,
                wishListItems: existingWishList,
                cartLength, totalCartAmount ,wishListlength,name
            })
        }

        const getNew = await fetchAllProducts()

        // Extract Product_image_ids from existingWishList
        const wishListProductImageIds = existingWishList.map((item) =>
            item.Product_image_id.toString()
        )

        // Filter out products from getNew that are already in the existingWishList
        const filteredGetNew = getNew.filter(
            (product) =>
                wishListProductImageIds.includes(product._id.toString())
        )

        // Merge existing wishlist with filtered products
        const wishListItems = existingWishList.map((wishListItem) => {
            const productDetails = getNew.find(
                (product) =>
                    product._id.toString() ===
                    wishListItem.Product_image_id.toString()
            )
            return {
                ...wishListItem.toObject(),
                productDetails,
            }
        })

        console.log("WISH LIST IS", wishListItems)
       
  

        // Pass the merged wishlist items to the view
        res.render("user/wishlist", {
            category,
            wishListItems,
            wishListlength,
            totalCartAmount,
            cartLength,
            name,
        })
    } catch (error) {
        console.error("Error getting wishlist:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}