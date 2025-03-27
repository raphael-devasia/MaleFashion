const OrderLine = require("../models/order_line")
const ShopOrder = require("../models/shop_order")
const OrderStatus = require("../models/order_status")
const ProductVariation = require("../models/productVariation")
const ProductImage = require("../models/productImage")
const Wallet = require("../models/wallet")
const ReferralItems = require("../models/referralItems")
const mongoose = require("mongoose")
const {
    OrderStatus: OrderStatusEnum,
    TransactionStatus,
} = require("../utils/enums")
const { AppError } = require("../utils/errors")
const Product_image = require("../models/productImage")

class OrderService {
    static async getAllOrders() {
        const orders = await OrderLine.aggregate([
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
                    from: "users",
                    localField: "Shop_orders.User_id",
                    foreignField: "_id",
                    as: "User_details",
                },
            },
            { $unwind: "$User_details" },
            {
                $lookup: {
                    from: "payment_types",
                    localField: "Shop_orders.Payment_method_id",
                    foreignField: "_id",
                    as: "Payment_method",
                },
            },
            { $unwind: "$Payment_method" },
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
        return orders.sort(
            (a, b) => b.order_statuses.createdAt - a.order_statuses.createdAt
        )
    }

    static async getOrderDetails(id) {
        const order = await OrderLine.findById(id).populate({
            path: "Order_id",
            model: "Shop_order",
            populate: { path: "Order_status", model: "Order_status" },
        })
        if (!order) throw new AppError("Order not found", 404)
        return order
    }

    static async cancelOrder(id) {
        const order = await this.getOrderDetails(id)
        console.log(order);
        
        const orderStatusId = order.Order_id.Order_status._id
        console.log(orderStatusId)
        
        const updatedShopOrder = await OrderStatus.findByIdAndUpdate(
            orderStatusId,
            { $set: { Status: OrderStatusEnum.CANCELLED } }, // Match case with enum
            { new: true }
        )
        if (!updatedShopOrder) {
            throw new Error("Failed to update shop order status")
        }

        for (let i = 0; i < order.Product_item_id.length; i++) {
            const productItemId = order.Product_item_id[i]
            if (!mongoose.Types.ObjectId.isValid(productItemId)) {
                console.warn(
                    `Invalid Product_item_id at index ${i}: ${productItemId}`
                )
                continue // Skip invalid IDs
            }

            const productImage = await Product_image.findById(
                order.Product_item_id[i]
            )
            if (!productImage) {
                    console.warn(`Product image not found for ID: ${productItemId}`);
                    continue;
                }

            const qtyToRestore = order.Qty[i] || 0; // Default to 0 if undefined

            if (qtyToRestore > 0) {
                // Only update if qty is positive
                await ProductVariation.findByIdAndUpdate(
                    productImage.Product_variation_id,
                    { $inc: { Qty_in_stock: qtyToRestore } },
                    { new: true }
                )
            }

           
           // Update entire Status array to "Cancelled"
            const cancelledStatuses = Array(order.Product_item_id.length).fill(OrderStatusEnum.CANCELLED);
            await OrderLine.findByIdAndUpdate(
                id,
                { $set: { Status: cancelledStatuses } }, // Set all elements to "Cancelled"
                { new: true }
            );
        }
    }

    static async updateOrderStatus(id, status) {
        const order = await this.getOrderDetails(id)
        const orderStatusId = order.Order_id.Order_status._id
        await OrderStatus.findByIdAndUpdate(orderStatusId, { Status: status })
    }

    static async cancelItem(orderId, productItemId) {
        const order = await OrderLine.findById(orderId)
        if (!order) throw new AppError("Order not found", 404)

        const index = order.Product_item_id.findIndex((id) =>
            id.equals(productItemId)
        )
        if (index === -1)
            throw new AppError("Product item not found in order", 404)

        const storeDiscount =
            (order.Qty[index] *
                order.Price[index] *
                order.Offer_percentage[index]) /
            100
        const couponDiscount =
            (order.Qty[index] *
                order.Price[index] *
                order.Coupon_percentage[index]) /
            100
        const productActualCost = order.Qty[index] * order.Price[index]
        const productCost = productActualCost - couponDiscount - storeDiscount

        await OrderLine.updateOne(
            { _id: orderId },
            {
                $set: {
                    [`Qty.${index}`]: 0,
                    [`Status.${index}`]: OrderStatusEnum.CANCELLED,
                },
            }
        )
        const productImage = await ProductImage.findById(productItemId)
        await ProductVariation.findByIdAndUpdate(
            productImage.Product_variation_id,
            { $inc: { Qty_in_stock: order.Qty[index] } }
        )

        const shopOrder = await ShopOrder.findByIdAndUpdate(order.Order_id, {
            $inc: {
                Product_cost: -productActualCost,
                Coupon_discount: -couponDiscount,
                Sales_discount: -storeDiscount,
                Order_total: -productCost,
            },
        })
        
        if (shopOrder.Order_status.Status === OrderStatusEnum.PAID) {
            const wallet = await Wallet.findOneAndUpdate(
                { user_id: shopOrder.User_id },
                { $inc: { Wallet_amount: productCost } },
                { new: true }
            )
            await ReferralItems.create({
                Referral_Amount: productCost,
                Status: TransactionStatus.SHOP_REFUND,
                Wallet_id: wallet._id,
            })
        }
    }

    static async shipItem(orderId, productItemId) {
        const order = await OrderLine.findById(orderId)
        if (!order) throw new AppError("Order not found", 404)

        const index = order.Product_item_id.findIndex((id) =>
            id.equals(productItemId)
        )
        if (index === -1)
            throw new AppError("Product item not found in order", 404)

        await OrderLine.updateOne(
            { _id: orderId },
            { $set: { [`Status.${index}`]: OrderStatusEnum.SHIPPED } }
        )
    }

    static async refundItem(orderId, productItemId) {
        const order = await OrderLine.findById(orderId)
        if (!order) throw new AppError("Order not found", 404)

        const index = order.Product_item_id.findIndex((id) =>
            id.equals(productItemId)
        )
        if (index === -1)
            throw new AppError("Product item not found in order", 404)

        const storeDiscount =
            (order.Qty[index] *
                order.Price[index] *
                order.Offer_percentage[index]) /
            100
        const couponDiscount =
            (order.Qty[index] *
                order.Price[index] *
                order.Coupon_percentage[index]) /
            100
        const productActualCost = order.Qty[index] * order.Price[index]
        const productCost = productActualCost - couponDiscount - storeDiscount

        await OrderLine.updateOne(
            { _id: orderId },
            {
                $set: {
                    [`Qty.${index}`]: 0,
                    [`Status.${index}`]: OrderStatusEnum.REFUNDED,
                },
            }
        )
        const productImage = await ProductImage.findById(productItemId)
        await ProductVariation.findByIdAndUpdate(
            productImage.Product_variation_id,
            { $inc: { Qty_in_stock: order.Qty[index] } }
        )

        const shopOrder = await ShopOrder.findByIdAndUpdate(order.Order_id, {
            $inc: {
                Product_cost: -productActualCost,
                Coupon_discount: -couponDiscount,
                Sales_discount: -storeDiscount,
                Order_total: -productCost,
            },
        })

        const wallet = await Wallet.findOneAndUpdate(
            { user_id: shopOrder.User_id },
            { $inc: { Wallet_amount: productCost } },
            { new: true }
        )
        await ReferralItems.create({
            Referral_Amount: productCost,
            Status: TransactionStatus.SHOP_REFUND,
            Wallet_id: wallet._id,
        })
    }
}

module.exports = OrderService
