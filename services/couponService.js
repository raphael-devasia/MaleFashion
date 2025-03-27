const Coupon = require("../models/coupons")
const User = require("../models/schema")
const { AppError } = require("../utils/errors")

class CouponService {
    static async getAllCoupons() {
        return await Coupon.find()
    }

    static async createCoupon(data) {
        const {
            offer_percentage,
            coupon_code,
            start_date,
            end_date,
            coupon_description,
            coupon_min,
            coupon_max,
        } = data
        const existing = await Coupon.findOne({ coupon_code })
        if (existing) throw new AppError("Coupon code already exists", 400)
        return await Coupon.create({
            coupon_code,
            offer_percentage,
            start_date,
            end_date,
            coupon_description,
            coupon_min,
            coupon_max,
        })
    }

    static async deleteCoupon(couponId) {
        const coupon = await Coupon.findByIdAndDelete(couponId)
        if (!coupon) throw new AppError("Coupon not found", 404)
        await User.updateMany(
            { coupon: coupon.coupon_code },
            { $pull: { coupon: coupon.coupon_code } }
        )
    }
}

module.exports = CouponService
