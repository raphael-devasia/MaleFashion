const orderLines = await Order_line.aggregate([
    {
        $lookup: {
            from: "shop_orders", // The collection name for Order
            localField: "Order_id",
            foreignField: "_id",
            as: "orderDetails",
        },
    },
    {
        $unwind: "$orderDetails",
    },
    {
        $lookup: {
            from: "order_statuses", // The collection name for Order_status
            localField: "orderDetails.Order_status",
            foreignField: "_id",
            as: "orderStatusDetails",
        },
    },
    {
        $unwind: "$orderStatusDetails",
    },
    {
        $addFields: {
            combined: {
                $zip: {
                    inputs: [
                        "$Product_name",
                        "$Qty",
                        "$Price",
                        "$Offer_percentage",
                        "$Coupon_percentage",
                        "$Status",
                        "$Product_item_id",
                        "$orderStatusDetails.createdAt",
                    ],
                },
            },
        },
    },
    {
        $unwind: "$combined",
    },
    {
        $match: { "combined.5": "Delivered" },
    },
    {
        $group: {
            _id: { $arrayElemAt: ["$combined", 0] },
            Product_item_id: {
                $first: { $arrayElemAt: ["$combined", 6] },
            },
            totalQty: { $sum: { $arrayElemAt: ["$combined", 1] } },
            totalPrice: {
                $sum: {
                    $multiply: [
                        {
                            $subtract: [
                                {
                                    $subtract: [
                                        {
                                            $arrayElemAt: ["$combined", 2],
                                        },
                                        {
                                            $divide: [
                                                {
                                                    $multiply: [
                                                        {
                                                            $arrayElemAt: [
                                                                "$combined",
                                                                2,
                                                            ],
                                                        },
                                                        {
                                                            $arrayElemAt: [
                                                                "$combined",
                                                                3,
                                                            ],
                                                        },
                                                    ],
                                                },
                                                100,
                                            ],
                                        },
                                    ],
                                },
                                {
                                    $divide: [
                                        {
                                            $multiply: [
                                                {
                                                    $subtract: [
                                                        {
                                                            $arrayElemAt: [
                                                                "$combined",
                                                                2,
                                                            ],
                                                        },
                                                        {
                                                            $divide: [
                                                                {
                                                                    $multiply: [
                                                                        {
                                                                            $arrayElemAt:
                                                                                [
                                                                                    "$combined",
                                                                                    2,
                                                                                ],
                                                                        },
                                                                        {
                                                                            $arrayElemAt:
                                                                                [
                                                                                    "$combined",
                                                                                    3,
                                                                                ],
                                                                        },
                                                                    ],
                                                                },
                                                                100,
                                                            ],
                                                        },
                                                    ],
                                                },
                                                {
                                                    $arrayElemAt: [
                                                        "$combined",
                                                        4,
                                                    ],
                                                },
                                            ],
                                        },
                                        100,
                                    ],
                                },
                            ],
                        },
                        { $arrayElemAt: ["$combined", 1] },
                    ],
                },
            },
        },
    },
    {
        $sort: { totalQty: -1 }, // Add this stage to sort by totalQty in descending order
    },
])