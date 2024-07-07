 <section class="breadcrumb-option">
        <div class="container">
            <div class="row">
                <div class="col-lg-12">
                    <div class="breadcrumb__text">
                        <h4>Shop</h4>
                        <div class="breadcrumb__links">
                            <a href="./index.html">Home</a>
                            <span>User</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    <!-- Breadcrumb Section End -->
    <main class="main">
        <section class="section-parent">
            <div class="profile-details">
                <div class="profile-inner">
    
                    <div class="account-management">
                        <div class="container mb-4 main-container">
                            <div class="row">
                                <div class="col-lg-4 pb-5">
                                    <!-- Account Sidebar-->
                                    <div class="author-card pb-3">
                                        <div class="author-card-cover"
                                            style="background-image: url(https://bootdey.com/img/Content/flores-amarillas-wallpaper.jpeg);">
                                            <a class="btn btn-style-1 btn-white btn-sm" href="#" data-toggle="tooltip"
                                                title=""
                                                data-original-title="You currently have 290 Reward points to spend"><i
                                                    class="fa fa-award text-md"></i>&nbsp;Wallet Balance: <%=
                                                    (userWallet.Wallet_amount).toFixed(2) %></a>
                                        </div>
                                        <div class="author-card-profile">
                                            <div class="author-card-avatar"><img
                                                    src="https://bootdey.com/img/Content/avatar/avatar1.png"
                                                    alt="Daniel Adams">
                                            </div>
                                            <div class="author-card-details">
                                                <h5 class="author-card-name text-lg">
                                                    <%= user.firstName %>
                                                        <%= user.lastName %>
                                                </h5>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="wizard">
                                        <nav class="list-group list-group-flush">
                                            <a class="list-group-item active" href="/user/orders">
                                                <div class="d-flex justify-content-between align-items-center">
                                                    <div><i class="fa fa-shopping-bag mr-1 text-muted"></i>
                                                        <div class="d-inline-block font-weight-medium text-uppercase">Orders
                                                            List</div>
                                                    </div>
                                                </div>
                                            </a>
                                            <a class="list-group-item " href="/user"><i
                                                    class="fa fa-user text-muted"></i>Profile Settings</a>
                                            <a class="list-group-item " href="/user/address"><i
                                                    class="fa fa-map-marker text-muted"></i>Addresses</a>
                                            <a class="list-group-item" href="/wishlist">
                                                <div class="d-flex justify-content-between align-items-center">
                                                    <div><i class="fa fa-heart mr-1 text-muted"></i>
                                                        <div class="d-inline-block font-weight-medium text-uppercase">My
                                                            Wishlist</div>
                                                    </div>
                                                </div>
                                            </a>
                                            <a class="list-group-item" href="/user/wallet">
                                                <div class="d-flex justify-content-between align-items-center">
                                                    <div><i class="fa fa-tag mr-1 text-muted"></i>
                                                        <div class="d-inline-block font-weight-medium text-uppercase">My
                                                            Wallet</div>
                                                    </div>
                                                </div>
                                            </a>
                                        </nav>
                                    </div>
                                </div>
                                <!-- Orders Table-->
                                <!-- Orders Table-->
                                <div class="col-lg-8 pb-5">
                                    <div class="d-flex justify-content-end pb-3">
                                        <div class="form-inline">
                                            <label class="text-muted mr-3" for="order-sort">Sort Orders</label>
                                            <select class="form-control" id="order-sort">
                                                <option>All</option>
                                                <option>Delivered</option>
                                                <option>In Progress</option>
                                                <option>Delayed</option>
                                                <option>Canceled</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="table-responsive">
                                        <table class="table table-hover mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Order #</th>
                                                    <th>Date Purchased</th>
                                                    <th>Status</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <% orderDetails.forEach(item => { %>

                                                    <tr>
                                                        <td><a class="navi-link" href="/user/orders/orderdetail/<%= item._id %>" data-toggle="modal">
                                                                <%= item.Shop_orders.Order_number %>
                                                            </a></td>
                                                        <td><%= (item.order_statuses.createdAt).toLocaleString() %></td>
                                                        <td><span class="badge  m-0">
                                                        <% function determineOverallStatus(statusArray) { if (statusArray.every(status=> status === 'Cancelled')) {
                                                            return 'Cancelled';
                                                            } else if (statusArray.every(status => status === 'Shipped')) {
                                                            return 'Shipped';
                                                            } else if (statusArray.every(status => status === 'Delivered')) {
                                                            return 'Delivered';
                                                            } else if (statusArray.every(status => status === 'Returned')) {
                                                            return 'Returned';
                                                            } else {
                                                            return 'Processing';
                                                            }
                                                            }
                                                        
                                                            const overallStatus = determineOverallStatus(item.Status);
                                                            %>
                                                        
                                                           
                                                        
                                                            <p class="card-text 
                                                            <% if (overallStatus === 'Cancelled' || overallStatus === 'Refunded') { %>
                                                                text-danger p-1
                                                            <% } else if (overallStatus === 'Processing' || overallStatus === 'Shipped') { %>
                                                                text-warning p-1
                                                            <% } else if (overallStatus === 'Delivered') { %>
                                                                text-success p-1
                                                            <% } else if (overallStatus === 'Returned') { %>
                                                                text-muted p-1
                                                            <% } %>">
                                                                <%= overallStatus %>
                                                            </p>


                                                            </span></td>
                                                        <td><span>$ <%= (item.Shop_orders.Order_total).toFixed(2) %></span></td>
                                                    </tr>
                                                 
                                                <% }) %>
                                               
                                               
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                </div>
                                </div>
                         
    
                            </div>
                        </div>
    
                        <div id="passwordCriteria" class="mt-2"></div>
                        <div class="alert alert-success" id="userSuccessMessage" style="display: none;"></div>
                    </div>
                </div>
            </div>
        </section>
    </main>




    const getOrders = async (req, res) => {
    const user = req.session.user
     const { page = 1, sort = "all" } = req.query
     const limit = 10
     const skip = (page - 1) * limit

     let query = {}
     if (sort !== "all") {
         query = { "order_statuses.Status": sort }
     }
     const totalOrders = await Order.countDocuments(query)
     const totalPages = Math.ceil(totalOrders / limit)
    if (user) {
        let category = await fetchCategories()
        const userdetails = await findUserByEmail(user)
        const userdata = await collection.findOne({email:user})
         const userWallet = await Wallet.findOne({ user_id: userdata._id })

            const OrderDetails = await Order_line.aggregate([
                {
                    $lookup: {
                        from: "shop_orders",
                        localField: "Order_id",
                        foreignField: "_id",
                        as: "Shop_orders",
                    },
                },
                { $unwind: "$Shop_orders" },
                {
                    $lookup: {
                        from: "order_statuses",
                        localField: "Shop_orders.Order_status",
                        foreignField: "_id",
                        as: "order_statuses",
                    },
                },
                { $unwind: "$order_statuses" },
            ])
            const objectIdString = userdetails.id.toString()
            const numericValue = objectIdString.match(/[a-fA-F0-9]{24}/)[0]
            let orderDetail = OrderDetails.filter(
                (e) => e.Shop_orders.User_id.toString() === numericValue
            )
            const orderDetails = orderDetail.sort(
                (a, b) => b.order_statuses.createdAt - a.order_statuses.createdAt
            )
       
        res.render("user/orders", {
            category,
            user: userdetails,
            orderDetails,
            userWallet,
        })
    } else {
        res.redirect("/home")
    }
}


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

        if (existingWishList.length < 1) {
            return res.status(400).json({ message: "No Products In wishlist" })
        }

        const getNew = await fetchAllProducts()
        const wishListItems = []

        const productPromises = existingWishList.map(async (item) => {
            const product = await fetchSingleProduct(item.Product_image_id)
            const productName =
                product.Product_variation_id.Product_item_id.Product_id
                    .product_name

            const getSingleProduct = getNew.filter((e) => {
                return (
                    e.Product.product_name
                        .trim()
                        .localeCompare(productName.trim(), undefined, {
                            sensitivity: "base",
                        }) === 0
                )
            })

            // Find unique colors and their associated sizes
           

            wishListItems.push({
                product,
               
            })
        })

        await Promise.all(productPromises)
console.log("category");
        res.render("user/wishlist", { category, wishListItems })
    } catch (error) {
        console.error("Error getting wishlist:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}
