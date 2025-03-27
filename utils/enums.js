const OrderStatus = Object.freeze({
    PENDING: "Pending",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded",
    PAID: "Paid",
    PROCESSING: "Processing",
})

const TransactionStatus = Object.freeze({
    SHOP_REFUND: "Shop Refund",
})

module.exports = { OrderStatus, TransactionStatus }
