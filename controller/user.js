const { MongoClient, ObjectId } = require("mongodb")
const collection = require("../models/schema")
const GoogleUser = require("../models/googleUser")
const Product_category = require("../models/productSchema")
const ProductImage = require("../models/productImage")
const otpGenerator = require("otp-generator")
const { MailGenerator, transporter } = require("../controller/mailer")
require("../middlewares/auth")
const path = require("path")
const Size_category = require("../models/sizeCategorySchema")
const Product = require("../models/products")
const ProductItem = require("../models/product_item")
const ProductVariation = require("../models/productVariation")
const SizeOption = require("../models/sizeSchema")
const Colours = require("../models/colorSchema")
const { log } = require("console")
const passport = require("passport")
const Shopping_cart = require("../models/shopping_cart")
const Shopping_cart_item = require("../models/shopping_cart_item")
const Shop_order = require("../models/shop_order")
const Order_status = require("../models/order_status")

const Address = require("../models/addresses")
const User_address = require("../models/userAddress")
const mongoose = require("mongoose")
const Payment_type = require("../models/payment_type")
const {
    calculateTotalCartAmount,
    getCartLength,
    getCartDetails,
    getWishlistLength
} = require("../utils/userProductsFunctions")
//////
const {
    fetchProductVariations,
    fetchAllProducts,
    findUserByEmail,
    cartProducts,
    fetchCategories,
    getTotalAmount,
    getTotalAmountFromSession,
    getProductsFromSession,
    fetchSingleProduct,
} = require("../utils/database")
const Order_line = require("../models/order_line")
const Wallet = require("../models/wallet")
const Referral_items = require("../models/referralItems")
const Product_image = require("../models/productImage")

//========>>>>>> ###### GET : http://localhost:5050/login ######

const getLogin = (req, res) => {
    const isAdmin = false
    if (req.session.user) {
        return res.redirect("/home")
    }

    res.render("base", { isAdmin, access: "USER" })
}

//========>>>>>> ###### POST : http://localhost:5050/login ######

const createLogin = async (req, res) => {
    const isAdmin = false
    const { email, password } = req.body
    let cartProduct = []
    let totalCartAmount = 0

    // Regular expression patterns for email and password validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/

    // Check if email matches the pattern
    if (!emailPattern.test(email)) {
        return res.render("base", { msg: "Invalid email format" })
    }

    // Check if password matches the pattern
    if (!passwordPattern.test(password)) {
        return res.render("base", { msg: "Invalid password format" })
    }
    try {
        // Check if email exists in database
        const checkUser = await collection.findOne({
            email: email,
            password: password,
        })
        const isActive = checkUser.is_active

        if (!checkUser) {
            return res.render("base", {
                msg: "Email or password is not valid",
                isAdmin,
            })
        } else if (!isActive) {
            return res.render("base", {
                msg: "Admin Blocked you From Accessing the Website",
                isAdmin,
            })
        } else {
            try {
                const userdetails = await findUserByEmail(email)
                const cartFinder = await Shopping_cart.find({
                    User_id: userdetails._id,
                })
                console.log("cartFinder:", cartFinder)

                if (cartFinder.length > 0) {
                    let cart = req.cookies.cart
                        ? JSON.parse(req.cookies.cart)
                        : []
                    cartData = cart

                    for (const item of cartData) {
                        const { Qty, product_image } = item

                        // Create a new entry in the Shopping_cart_item collection
                        const newCart = await Shopping_cart_item.create({
                            Product_item_id: product_image,
                            Qty: Qty,
                            Cart_id: cartFinder._id,
                            // Add any other necessary fields
                        })
                        // console.log("NEW CART :", newCart)
                    }
                    res.clearCookie("cart")
                } else {
                    let cart = req.cookies.cart
                        ? JSON.parse(req.cookies.cart)
                        : []
                    cartData = cart
                    const creteUserCart = await Shopping_cart.create({
                        User_id: userdetails._id,
                    })
                    // Create a new entry in the Shopping_cart_item collection
                    for (const item of cartData) {
                        const { Qty, product_image } = item

                        // Create a new entry in the Shopping_cart_item collection
                        const newCart = await Shopping_cart_item.create({
                            Product_item_id: product_image,
                            Qty: Qty,
                            Cart_id: creteUserCart._id,
                            // Add any other necessary fields
                        })
                        res.clearCookie("cart")
                    }
                }

                req.session.user = email

const redirectTo = req.session.redirectTo || "/home"
console.log("Redirect to", redirectTo)
delete req.session.redirectTo
res.redirect(redirectTo)



                // return res.redirect("/home")
            } catch (error) {
                console.log(error)
            }

            //  const userdetails = await findUserByEmail(user)
            //  const cartFinder = await Shopping_cart.find({ User_id: userdetails._id})
            //  console.log(cartFinder)
            //  if(cartFinder){

            //  let cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : []
            //  cartData = cart
            // console.log(cartData);

            //  }
            // console.log(userdetails)
        }

        // If both email and password are valid, set the user in session and redirect to home
    } catch (error) {
        return res.render("base", {
            msg: "An error occurred, please try again later",
        })
    }
}
//========>>>>>> ###### GET : http://localhost:5050/register ######
const getRegister = (req, res) => {
    const isAdmin = false
    const referral = req.query.referral
    console.log("Step1", referral)
    if (req.session.user) {
        return res.redirect("/home")
    }
    const userSuccess = req.flash("info")

    res.render("user/register", {
        isAdmin,
        referral,
        access: "User",
        userSuccess: userSuccess.length > 0 ? userSuccess[0] : null,
        adminVarify: req.flash("admin"),
    })
}
//========>>>>>> ###### POST : http://localhost:5050/register/generateOTP ######

const generateOTP = async (req, res) => {
    const userEmail = req.body.userEmail
    const referral = req.body.referral
    console.log("Step2", referral)
    console.log(userEmail)
    const existingUser = await collection.findOne({ email: userEmail })
    if (existingUser) {
        req.flash("info", "Email exist Please Login or Enter a New Email!")
        return res.redirect("/register")
    }

    req.app.locals.OTP = await otpGenerator.generate(6, {
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
    })

    // body of the email
    var email = {
        body: {
            name: "Hello User",
            intro: "Welcome Male fashion",
            outro: ` Your One time Password is ${req.app.locals.OTP} `,
        },
    }

    var emailBody = MailGenerator.generate(email)

    let message = {
        from: process.env.EMAIL,
        to: userEmail,
        subject: "Signup Successful",
        html: emailBody,
    }
    console.log(message)
    // send mail
    transporter
        .sendMail(message)
        .then(() => {
            return res.status(200).render("user/OTPvalidation", {
                OTP: req.app.locals.OTP,
                userEmail,
                referral,
            })
        })
        .catch((error) => {
            req.flash(
                "info",
                "There was an error generating the OTP. Please try again."
            )
            res.redirect("/register")
        })

    // res.status(201).send({ code: req.app.locals.OTP })
}

//========>>>>>> ###### POST : http://localhost:5050/verifyOTP ######

const verifyOTP = async (req, res) => {
    const code = req.body.otp
    const email = req.body.userEmail
    const referral = req.body.referral
    console.log("Step3", referral)
    console.log(`the email is ${email}`)
    if (parseInt(req.app.locals.OTP) === parseInt(code)) {
        req.app.locals.OTP = null
        req.app.resetSession = true
        return res.render("userSignup", {
            email: email,
            referral,
        })
    } else {
        return res.render("user/OTPvalidation", {
            msg: "Invalid OTP!",
            userEmail: email,
            referral,
        })
    }
}

const createRegister = async (req, res) => {
    const isAdmin = false
    let referral = req.body.referral
    const userData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password,
        referral: referral,
        phone: req.body.phone,
        email: req.body.email,
    }

    try {
        // Convert referral to ObjectId if it exists and is valid
        if (
            referral &&
            mongoose.Types.ObjectId.isValid(referral) &&
            referral.length === 24
        ) {
            referral = new mongoose.Types.ObjectId(referral)
        } else {
            referral = null // Set referral to null if it's not valid
        }

        // Insert user data into the collection
        const registerData = await collection.create(userData)

        if (referral) {
            const referredUser = await collection.findById(referral)
            if (referredUser) {
                const newReferralWallet = await Wallet.create({
                    user_id: registerData._id,
                    Wallet_amount: 250,
                })
                await Referral_items.create({
                    Referral_Amount: 250,
                    Status: "Welcome Bonus",
                    Referred_by: referredUser._id,
                    Wallet_id: newReferralWallet._id,
                })

                // Check existing wallet for the referred user
                const existingWallet = await Wallet.findOne({
                    user_id: referral,
                })
                if (existingWallet) {
                    await Wallet.findByIdAndUpdate(
                        existingWallet._id,
                        { $inc: { Wallet_amount: 250 } },
                        { new: true }
                    )
                    await Referral_items.create({
                        Referral_Amount: 250,
                        Status: "Referral Income",
                        Refferals_ids: registerData._id,
                        Wallet_id: existingWallet._id,
                    })
                }
            }
        } else {
            // If no referral, create a new wallet for the new user
            await Wallet.create({
                user_id: registerData._id,
                Wallet_amount: 0,
            })
        }

        // Redirect after a delay
        setTimeout(() => {
            res.redirect("/")
        }, 2000)
    } catch (error) {
        console.error("Registration error:", error)
        res.status(500).send("Server error during registration")
    }
}

//========>>>>>> ###### GET : http://localhost:5050/home ######

// const getHome = async (req, res) => {
//     try {
//         // Check if there is a session user
//         if (!req.session.user) {
//             // If no session user, redirect to the home page with default data
//             const category = await Product_category.find()
//             const productVariation = await ProductImage.find().populate({
//                 path: "Product_variation_id",
//                 populate: [
//                     {
//                         path: "Product_item_id",
//                         model: "Product_item",
//                         populate: [
//                             {
//                                 path: "Product_id",
//                                 model: "Product",
//                                 populate: {
//                                     path: "product_category_id",
//                                     model: "ProductCategory",
//                                 },
//                             },
//                             {
//                                 path: "Colour_id",
//                                 model: "Colour",
//                             },
//                         ],
//                     },
//                     {
//                         path: "Size_id",
//                         model: "SizeOption",
//                     },
//                 ],
//             })

//             // Render the home page with default data
//             return res.render("user/index", {
//                 data: category,
//                 products: productVariation,
//                 name: null, // Assuming name is not available when there's no session user
//             })
//         }

//         // If there is a session user, proceed with fetching user data
//         let user
//         // Check if the user is in the local collection
//         user = await collection.findOne({ email: req.session.user })

//         // If user is not found in local collection, check GoogleUser collection
//         if (!user) {
//             user = await GoogleUser.findOne({ email: req.session.user })
//         }

//         const category = await Product_category.find()
//         const productVariation = await ProductImage.find().populate({
//             path: "Product_variation_id",
//             populate: [
//                 {
//                     path: "Product_item_id",
//                     model: "Product_item",
//                     populate: [
//                         {
//                             path: "Product_id",
//                             model: "Product",
//                             populate: {
//                                 path: "product_category_id",
//                                 model: "ProductCategory",
//                             },
//                         },
//                         {
//                             path: "Colour_id",
//                             model: "Colour",
//                         },
//                     ],
//                 },
//                 {
//                     path: "Size_id",
//                     model: "SizeOption",
//                 },
//             ],
//         })

//         const name = user.firstName
//         return res.render("user/index", {
//             data: category,
//             products: productVariation,
//             name,
//         })
//     } catch (error) {
//         console.log(error)
//         // Handle error appropriately
//     }
// }

//========>>>>>> ###### GET : http://localhost:5050/products ######

// const getProducts = async (req,res)=>{
//     try {
//          const category = await Product_category.find()

//          const productVariation = await ProductImage.find().populate({
//              path: "Product_variation_id",
//              populate: [
//                  {
//                      path: "Product_item_id",
//                      model: "Product_item",
//                      populate: [
//                          {
//                              path: "Product_id",
//                              model: "Product",
//                              populate: {
//                                  path: "product_category_id",
//                                  model: "ProductCategory",
//                              },
//                          },
//                          {
//                              path: "Colour_id",
//                              model: "Colour",
//                          },
//                      ],
//                  },
//                  {
//                      path: "Size_id",
//                      model: "SizeOption",
//                  },
//              ],
//          })

//          console.log(productVariation)
//         res.render("user/shop", { data: productVariation, category })
//     } catch (error) {

//     }
// }

const getLogout = (req, res) => {
    const isAdmin = false
    req.session.user=null

    res.redirect("/")
}

//========>>>>>> ###### GET : http://localhost:5050/forgot-password ######
const forgotPassword = async (req, res) => {
    const userSuccess = req.flash("info")
    res.render("user/forgot", {
        userSuccess: userSuccess.length > 0 ? userSuccess[0] : null,
    })
}

//========>>>>>> ###### POST : http://localhost:5050/forgot-password ######
const checkPassword = async (req, res) => {
    const email = req.body.email
    try {
        const checkEmail = await collection.findOne({ email: email })
        if (checkEmail) {
            const userEmail = req.body.userEmail
            console.log(userEmail)
            req.app.locals.OTP = await otpGenerator.generate(6, {
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                specialChars: false,
            })

            // body of the email
            var newemail = {
                body: {
                    name: "Hello User",
                    intro: "Welcome Male fashion",
                    outro: ` Your One time Password is ${req.app.locals.OTP} `,
                },
            }

            var emailBody = MailGenerator.generate(newemail)

            let message = {
                from: process.env.EMAIL,
                to: userEmail,
                subject: "Signup Successful",
                html: emailBody,
            }

            // send mail
            transporter
                .sendMail(message)
                .then(() => {
                    return res.status(200).render("user/OTPvalidation", {
                        OTP: req.app.locals.OTP,
                        userEmail,
                        passwordReset: true,
                    })
                })
                .catch((error) => {
                    req.flash(
                        "info",
                        "There was an error generating the OTP. Please try again."
                    )
                    res.redirect("/forgot-password")
                })

            // return res.render("user/password")
        } else {
            req.flash(
                "info",
                "The email you entered does not match any records. Please enter a correct email."
            )
            return res.redirect("/forgot-password")
        }
    } catch (error) {
        req.flash(
            "info",
            "An error occurred while checking password. Please try again later."
        )
        return res.redirect("/forgot-password")
    }
}

const registerMail = async (req, res) => {
    //  const userEmail = req.body.userEmail
    //  console.log(userEmail)
    //  // body of the email
    //  var email = {
    //      body: {
    //          name: "Hello User",
    //          intro: "Welcome to Daily Tuition! We're very excited to have you on board.",
    //          outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
    //      },
    //  }
    //  var emailBody = MailGenerator.generate(email)
    //  let message = {
    //      from: process.env.EMAIL,
    //      to: userEmail,
    //      subject: "Signup Successful",
    //      html: emailBody,
    //  }
    //  // send mail
    //  transporter
    //      .sendMail(message)
    //      .then(() => {
    //          return res
    //              .status(200)
    //              .send({ msg: "You should receive an email from us." })
    //      })
    //      .catch((error) => res.status(500).send({ Error: "There is an error" }))
}
const passwordOTP = async (req, res) => {
    const userEmail = req.body.userEmail
    console.log(userEmail)

    try {
        const checkEmail = await collection.findOne({ email: userEmail })
        if (checkEmail) {
            const userEmail = req.body.userEmail
            console.log(userEmail)
            req.app.locals.OTP = await otpGenerator.generate(6, {
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                specialChars: false,
            })

            // body of the email
            var newemail = {
                body: {
                    name: "Hello User",
                    intro: "Welcome Male fashion",
                    outro: ` Your One time Password is ${req.app.locals.OTP} `,
                },
            }

            var emailBody = MailGenerator.generate(newemail)

            let message = {
                from: process.env.EMAIL,
                to: userEmail,
                subject: "Signup Successful",
                html: emailBody,
            }

            // send mail
            transporter
                .sendMail(message)
                .then(() => {
                    return res.status(200).render("user/OTPvalidation", {
                        OTP: req.app.locals.OTP,
                        userEmail,
                        passwordReset: true,
                    })
                })
                .catch((error) => {
                    req.flash(
                        "info",
                        "There was an error generating the OTP. Please try again."
                    )
                    res.redirect("/forgot-password")
                })

            // return res.render("user/password")
        } else {
            req.flash(
                "info",
                "The email you entered does not match any records. Please enter a correct email."
            )
            return res.redirect("/forgot-password")
        }
    } catch (error) {
        req.flash(
            "info",
            "An error occurred while checking password. Please try again later."
        )
        return res.redirect("/forgot-password")
    }
}
const passwordConfirm = async (req, res) => {
    const code = req.body.otp
    const email = req.body.userEmail
    console.log(code)
    console.log(`the email is ${email}`)
    if (parseInt(req.app.locals.OTP) === parseInt(code)) {
        req.app.locals.OTP = null
        req.app.resetSession = true
        return res.render("user/password", {
            email: email,
        })
    } else {
        req.flash("msg", "Invalid OTP!")
        req.flash("userEmail", email)
        return res.redirect("/passwordOTP")
    }
}
const newPassword = async (req, res) => {
    const { email, newPassword } = req.body

    try {
        const existingUser = await collection.findOne({ email: email })

        // Check if the new password is the same as the current password
        if (existingUser && existingUser.password === newPassword) {
            req.flash("email", email)
            req.flash(
                "msg",
                "Enter a password different from the current password"
            )
            return res.redirect("/passwordconfirmation")
        }

        // Update the user's password if the new password is valid
        await collection.updateOne(
            { email: email },
            { $set: { password: newPassword } }
        )

        req.flash("msg", "Password has been successfully updated")
        return res.redirect("/login") // Redirect to the login page after successful password update
    } catch (error) {
        console.error(error)
        req.flash("msg", "An error occurred. Please try again.")
        return res.redirect("/passwordconfirmation")
    }
}

const displayOTP = async (req, res) => {
    res.render("user/OTPvalidation", {
        msg: req.flash("msg"),
        userEmail: req.flash("userEmail"),
        passwordReset: true,
    })
}
const confirmPassword = async (req, res) => {
    const msg = req.flash("msg") // Retrieve flash message
    res.render("user/password", {
        email: req.flash("email"),
        msg: msg[0],
    })
}
//========>>>>>> ###### GET : http://localhost:5050/user ######
const userDetails = async (req, res) => {
    const userData = req.session.user
    const isAdmin = false
    let category = await fetchCategories()
    const msg = req.flash("info")
    const user = await collection.findOne({ email: userData })
    const userWallet = await Wallet.findOne({ user_id: user._id })

    // if (req.session.user) {
    // Find user details
    const userdetails = await findUserByEmail(userData)

    // Filter the shipping addresses
    const billingAddress = userdetails.address_id.find(
        (a) => a.Is_Billing_default
    )
  const { cartLength, totalCartAmount } = await getCartDetails(req.session.user)
  const wishListlength = await getWishlistLength(userData)
    return res.render("user/editprofile", {
        isAdmin,
        access: "USER",
        category,
        user: userdetails,
        userdetails,
        msg: msg[0],
        billingAddress,
        userWallet,
        cartLength,
        totalCartAmount,
        wishListlength,
        name: user.firstName
    })
    // }

    // res.redirect("/home")
}
//========>>>>>> ###### POST : http://localhost:5050/userupdate ######
const userUpdate = async (req, res) => {
    const userData = req.session.user
    const { firstName, lastName, email, password } = req.body
    const isAdmin = false

    // if (req.session.user) {
    const userdetails = await findUserByEmail(userData)
    const updatedUser = await collection.findByIdAndUpdate(
        userdetails._id,
        {
            firstName,
            lastName,

            password,
        },
        { new: true }
    )

    req.flash("info", "User Profile Updated Successfully!")
    return res.redirect("/user")
}

// }

// res.redirect("/home")

//========>>>>>> ###### GET : http://localhost:5050/user/address ######
const getAddress = async (req, res) => {
    const user = req.session.user
    let category = await fetchCategories()
    const userdetails = await findUserByEmail(user)
    const userData = await collection.findOne({email:user})
    const userWallet = await Wallet.findOne({ user_id: userData._id })
    const address = userdetails.address_id.filter((a) => a.Is_Active)
    const shippingAddress = userdetails.address_id.filter(
        (a) => a.Is_Shipping_default
    )
    const billingAddress = userdetails.address_id.filter(
        (a) => a.Is_Billing_default
    )
     const { cartLength, totalCartAmount } = await getCartDetails(
         req.session.user
     )
   const wishListlength = await getWishlistLength(user)
    res.render("user/adressbook", {
        category,
        address,
        access: "USER",
        userdetails,
        shippingAddress,
        billingAddress,
        totalCartAmount,
        cartLength,
        userWallet,
        wishListlength,
        name: userdetails.firstName
    })
}
//========>>>>>> ###### GET : http://localhost:5050/user/address/addnew ######
const newAddress = async (req, res) => {
    const isAdmin = false
    let category = await fetchCategories()
    const msg = req.flash("info")
    const user = req.session.user
    const userData = await collection.findOne({ email: user })
    const userWallet = await Wallet.findOne({ user_id: userData._id })

    // if (req.session.user) {
    const userdetails = await findUserByEmail(user)
 const wishListlength = await getWishlistLength(user)
 const { cartLength, totalCartAmount } = await getCartDetails(req.session.user)
    return res.render("user/addAddress", {
        isAdmin,
        access: "USER",
        category,
        user: userdetails,
        userdetails,
        msg: msg[0],
        userWallet,
        wishListlength,
        cartLength,
        totalCartAmount,
        name: userdetails.firstName,

    })
}
//========>>>>>> ###### POST : http://localhost:5050/user/addnewaddress ######
const addNewAddress = async (req, res) => {
    const userDetails = req.session.user
    const {
        firstName,
        lastName,
        houseNumber,
        addressLine2,
        addressLine1,
        postalCode,
        country,
        state,
    } = req.body
    try {
        const newAddress = new Address({
            FirstName: firstName,
            LastName: lastName,
            House_number: houseNumber,
            Address_line_1: addressLine1,
            Address_line_2: addressLine2,
            Postal_code: postalCode,
            State: state,
            Country: country,
        })
        await newAddress.save()

        const newUserAddress = new User_address({
            Is_Billing_default: false,
            Is_Shipping_default: false,
            Address_id: newAddress._id,
        })

        await newUserAddress.save()

        // Find the user and update the address_id
        const user = await collection
            .findOneAndUpdate(
                { email: userDetails },
                { $push: { address_id: newUserAddress._id } },
                { new: true }
            )
            .populate("address_id")

        if (!user) {
            return res.render("errorPage", { message: "User not found" })
        }

        return res.redirect("/user/address")
    } catch (error) {
        return res.render("errorPage", {
            message: "An error occurred. Please try again.",
            error: error.message,
        })
    }
}

const deleteAddress = async (req, res) => {
    const id = req.query.id
    try {
        const updatedAddress = await User_address.findByIdAndUpdate(
            id,
            { Is_Active: false },
            { new: true }
        )
        if (updatedAddress) {
            res.status(200).send({ message: "Address deleted successfully" })
        } else {
            res.status(404).send({ message: "Address not found" })
        }
    } catch (error) {
        res.status(500).send({ message: "Server error", error })
    }
}
//========>>>>>> ###### GET : http://localhost:5050/updateaddress/ ######
const editAddress = async (req, res) => {
    const userData = req.session.user
    const id = req.params.id
    try {
        // Fetch user details
        const userdetails = await findUserByEmail(userData)
         const user = await collection.findOne({ email: userData })
         const userWallet = await Wallet.findOne({ user_id: user._id })

        // Check if userdetails contains address details
        if (
            !userdetails ||
            !userdetails.address_id ||
            !Array.isArray(userdetails.address_id)
        ) {
            return res.status(404).send({ message: "Address not found" })
        }

        // Find the address document based on the provided ID
        const address = userdetails.address_id.find(
            (address) => address._id.toString() === id
        )

        // Check if the address with the provided ID exists
        if (!address) {
            return res.status(404).send({ message: "Address not found" })
        }

        // Fetch categories (assuming this function is defined elsewhere)
        const category = await fetchCategories()

        const wishListlength = await getWishlistLength(userData)
        const { cartLength, totalCartAmount } = await getCartDetails(
            req.session.user
        )

        res.render("user/editaddress", {
            category,
            address,
            access: "USER",
            user: userdetails,
            userdetails,
            userWallet,
            name: user.firstName,
            wishListlength,
            cartLength,
            totalCartAmount,
        })
    } catch (error) {
        // Handle errors
        console.error(error)
        res.status(500).send({ message: "Server error", error })
    }
}

//========>>>>>> ###### POSt : http://localhost:5050/user/updateaddress/ ######
const updateAddress = async (req, res) => {
    try {
        const {
            addressId,
            firstName,
            lastName,
            houseNumber,
            addressLine2,
            addressLine1,
            postalCode,
            country,
            state,
        } = req.body

        console.log(addressId)

        // Update the address document
        const address = await Address.findByIdAndUpdate(
            addressId,
            {
                FirstName: firstName,
                LastName: lastName,
                House_number: houseNumber,
                Address_line_1: addressLine1,
                Address_line_2: addressLine2,
                Postal_code: postalCode,
                State: state,
                Country: country,
            },
            { new: true }
        )

        if (!address) {
            // Address not found
            return res.status(404).send({ message: "Address not found" })
        }

        // Redirect to the address page after successful update
        res.redirect("/user/address")
    } catch (error) {
        // Handle errors
        console.error(error)
        res.status(500).send({ message: "Server error", error })
    }
}
//========>>>>>> ###### GET : http://localhost:5050/user/setshipping/ ######
const setShipping = async (req, res) => {
    const user = req.session.user
    let newShipping
    try {
        const id = req.params.id
        console.log(id)

        // Find user details
        const userdetails = await findUserByEmail(user)
console.log(userdetails)
        // Filter the shipping addresses
        const shippingAddress = userdetails.address_id.find(
            (a) => a.Is_Shipping_default
        )

        // If a shipping address is found, update its Is_Shipping_default to false
        if (shippingAddress) {
            await User_address.findByIdAndUpdate(
                shippingAddress._id,
                { Is_Shipping_default: false },
                { new: true }
            )
        }

        // Set the new shipping address to true
        newShipping = await User_address.findByIdAndUpdate(
            id,
            { Is_Shipping_default: true },
            { new: true }
        ).populate({
            path: "Address_id",
            model:Address
        })

        console.log(newShipping)
        res.status(200).json(newShipping)
    } catch (error) {
        console.error(error)
        res.status(500).send({ message: "Server error", error })
    }
}



//========>>>>>> ###### GET : http://localhost:5050/user/setbilling/ ######
const setBilling = async (req, res) => {
    const user = req.session.user
    let newBilling
    try {
        const id = req.params.id
        console.log(id)

        // Find user details
        const userdetails = await findUserByEmail(user)
        console.log(userdetails)

        // Filter the billing addresses
        const billingAddress = userdetails.address_id.find(
            (a) => a.Is_Billing_default
        )

        // If a billing address is found, update its Is_Billing_default to false
        if (billingAddress) {
            await User_address.findByIdAndUpdate(
                billingAddress._id,
                { Is_Billing_default: false },
                { new: true }
            )
        }

        // Set the new billing address to true
        newBilling = await User_address.findByIdAndUpdate(
            id,
            { Is_Billing_default: true },
            { new: true }
        ).populate({
            path: "Address_id",
            model: Address,
        })

        console.log(newBilling)
        res.status(200).json(newBilling)
    } catch (error) {
        console.error(error)
        res.status(500).send({ message: "Server error", error })
    }
}

 const getOrders = async (req, res) => {
     const user = req.session.user
     const { page = 1 } = req.query // 1. Get page parameter from query
     const limit = 10 // 2. Number of orders per page
     const skip = (page - 1) * limit // 3. Calculate the number of documents to skip for pagination

     if (user) {
         let category = await fetchCategories()
         const userdetails = await findUserByEmail(user)
         const userdata = await collection.findOne({ email: user })
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
         // Sort orders by status creation date (latest first)
         const sortedOrderDetail = orderDetail.sort(
             (a, b) =>
                 new Date(b.order_statuses.createdAt) -
                 new Date(a.order_statuses.createdAt)
         )

         // Calculate totalOrders after sorting
         const totalOrders = sortedOrderDetail.length

         // Get the orders for the current page
         const orderDetails = sortedOrderDetail.slice(skip, skip + limit)

         // Calculate totalPages for pagination
         const totalPages = Math.ceil(totalOrders / limit)
          const wishListlength = await getWishlistLength(user)
           const { cartLength, totalCartAmount } = await getCartDetails(
               req.session.user
           )

         res.render("user/orders", {
             category,
             user: userdetails,
             userdetails,
             orderDetails,
             userWallet,
             wishListlength,
             name: userdata.firstName,
             currentPage: parseInt(page), // 5. Pass current page number to the template
             totalPages,
             cartLength,
             totalCartAmount,
         })
     } else {
         res.redirect("/home")
     }
 }
const getOrderDetails = async (req, res) => {
    const user = req.session.user
    const id = req.params.id
    if (user) {
        let category = await fetchCategories()
        const userdetails = await findUserByEmail(user)
        const userdata = await collection.findOne({ email: user })
        const userWallet = await Wallet.findOne({ user_id: userdata._id })

        const orderDetails = await Order_line.findById(id).populate({
            path: "Order_id",
            model: "Shop_order",
            populate: [
                {
                    path: "Order_status",
                    model: "Order_status",
                },
                {
                    path: "Payment_method_id",
                    model: "Payment_type",
                },
            ],
        })

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
const wishListlength = await getWishlistLength(user)
const { cartLength, totalCartAmount } = await getCartDetails(req.session.user)
       
        res.render("user/orderDetails", {
            category,
            userdetails,
            orderDetails,
            productArray,
            userWallet,
            wishListlength,
            cartLength,
            totalCartAmount,
            name: userdetails.firstName
        })
    } else {
        res.redirect("/home")
    }
}

const deleteOrder = async (req, res) => {
    const id = req.params.id

    try {
        const user = await findUserByEmail(req.session.user)
        if (!user) {
            return res.status(404).send("User not found")
        }

        const orderDetails = await Order_line.findById(id).populate({
            path: "Order_id",
            model: "Shop_order",
            populate: [
                { path: "Order_status", model: "Order_status" },
                { path: "Payment_method_id", model: "Payment_type" },
            ],
        })

        if (!orderDetails) {
            return res.status(404).send("Order not found")
        }

        const orderStatusId = orderDetails.Order_id.Order_status._id
        const paymentMethodId = orderDetails.Order_id.Payment_method_id._id
        const amount = orderDetails.Order_id.Order_total

        const paymentMethod = await Payment_type.findById(paymentMethodId)
        if (!paymentMethod) {
            return res.status(404).send("Payment method not found")
        }

        // Update the order status to "Cancelled"
        const statusUpdate = await Order_status.findByIdAndUpdate(
            orderStatusId,
            { $set: { Status: "Cancelled" } },
            { new: true }
        )

        if (!statusUpdate) {
            return res.status(500).send("Order status update failed")
        }

        // If the payment method is "Credit Card" or "Wallet Pay", update the wallet amount
        console.log("Testing pahes :", paymentMethod)
        if (
            paymentMethod.Value === "Credit Card" ||
            paymentMethod.Value === "Wallet Payment"
        ) {
            const walletUpdate = await Wallet.findOneAndUpdate(
                { user_id: user._id },
                { $inc: { Wallet_amount: amount } },
                { new: true }
            )
            await Referral_items.create({
                Referral_Amount: amount,
                Status: "Shop Refund",

                Wallet_id: walletUpdate._id,
            })

            if (!walletUpdate) {
                return res.status(500).send("Wallet update failed")
            }

            // Update the order status to "Refunded"
            const payStatusUpdate = await Order_status.findByIdAndUpdate(
                orderStatusId,
                { $set: { Status: "Refunded" } },
                { new: true }
            )

            if (!payStatusUpdate) {
                return res.status(500).send("Payment status update failed")
            }
        }

        // Update the stock quantities of the products
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

        for (const e of productArray) {
            const numberQty = parseInt(e.Qty)

            try {
                const updateStock = await ProductVariation.findByIdAndUpdate(
                    e.Product_item.Product_variation_id._id,
                    { $inc: { Qty_in_stock: numberQty } }
                )

                console.log(
                    `Updated product variation ${e.Product_item.Product_variation_id._id} with ${numberQty} units.`
                )
            } catch (err) {
                console.error(
                    `Error updating product variation ${e.Product_item.Product_variation_id._id}:`,
                    err
                )
            }
        }

        res.redirect("/user/orders")
    } catch (error) {
        console.error("Error deleting order:", error)
        res.status(500).send("Server error during order deletion")
    }
}

const getWallet = async (req, res) => {
    const user = req.session.user

    if (user) {
        const category = await Product_category.find()
        const userDetails = await findUserByEmail(user)
        const userWallet = await Wallet.findOne({ user_id: userDetails._id })
        const transaction = await Referral_items.find({
            Wallet_id: userWallet._id,
        })
       const transactions = transaction.sort(
           (a, b) => b.createdAt - a.createdAt
       )
 const wishListlength = await getWishlistLength(user)
 const { cartLength, totalCartAmount } = await getCartDetails(req.session.user)
        res.render("user/wallet", {
            category,
            userWallet,
            transactions,
            userDetails,
            userdetails: userDetails,
            wishListlength,
            cartLength,
            totalCartAmount,
            name: userDetails.firstName,
            currentRoute: "/user/wallet",
        })
    } else {
        res.redirect("/")
    }
}

//////////CAncel Order Item

const cancelItem = async (req, res) => {
    const order_Id = req.query.orderId
    const product_image_id = req.params.id
    const orderId = new ObjectId(order_Id)
    const productItemId = new ObjectId(product_image_id)

    const order = await Order_line.findById(orderId)

    if (order) {
        // Get the index of the product item to be removed
        const index = order.Product_item_id.findIndex((id) =>
            id.equals(productItemId)
        )

        if (index !== -1) {
            // Update the document to remove the item at the identified index from all arrays
            // Construct the field path for the specific quantity to be updated
            const quantityFieldPath = `Qty.${index}`
            const statusFieldPath = `Status.${index}`
            const storeDiscount =
                (order.Qty[index] *
                    order.Price[index] *
                   (order.Offer_percentage[index] /
                100))
            const couponDiscount =
                (order.Qty[index] *
                    order.Price[index] *
                    (order.Coupon_percentage[index] /
                100))
            const productActualCost = order.Qty[index] * order.Price[index]
            const productCost =
                productActualCost - couponDiscount - storeDiscount

            // Update the document to set the quantity to zero
            const updateResult = await Order_line.updateOne(
                { _id: orderId },
                {
                    $set: {
                        [quantityFieldPath]: 0,
                        [statusFieldPath]: "Cancelled",
                    },
                }
            )
            const ProductImage = await Product_image.findById(productItemId)
            const stockUpdate = await ProductVariation.findByIdAndUpdate(
                ProductImage.Product_variation_id,
                { $inc: { Qty_in_stock: order.Qty[index] } }
            )
            const shop_order = await Shop_order.findByIdAndUpdate(
                order.Order_id,
                {
                    $inc: {
                        Product_cost: -productActualCost,
                        Coupon_discount: -couponDiscount,
                        Sales_discount: -storeDiscount,
                        Order_total: -productCost,
                    },
                }
            )

            const OrderStatus = await Order_status.findById(
                shop_order.Order_status
            )
            if (OrderStatus.Status == "Paid") {
                const user = await findUserByEmail(req.session.user)
                const findWallet = await Wallet.findOneAndUpdate(
                    { user_id: user._id },
                    { $inc: { Wallet_amount: productCost } }
                )
                const transaction = await Referral_items.create({
                    Referral_Amount:productCost,
                    Status:"Shop Refund",
                    Wallet_id: findWallet._id
                })
            }
           res.redirect('/user/orders')
        } else {
             res.redirect("/user/orders")   
        }
    } else {
        res.redirect("/user/orders")
    }
}
const confirmDelivery = async (req, res) => {
    const orderId = req.query.orderId
    const productItemId = req.params.id

    try {
        const order = await Order_line.findById(orderId)

        if (order) {
            // Get the index of the product item to be updated
            const index = order.Product_item_id.findIndex((id) =>
                id.equals(productItemId)
            )

            if (index !== -1) {
                // Construct the field path for the specific status to be updated
                const statusFieldPath = `Status.${index}`

                // Update the document to set the status to 'Shipped'
                await Order_line.updateOne(
                    { _id: orderId },
                    {
                        $set: {
                            [statusFieldPath]: "Delivered",
                        },
                    }
                )

                res.redirect(`/user/orders/orderdetail/${orderId}`)
            } else {
                console.log("Failure 1: Product item not found in the order.")
                res.redirect(`/user/orders/orderdetail/${orderId}`)
            }
        } else {
            console.log("Failure 2: Order not found.")
            res.redirect(`/user/orders/orderdetail/${orderId}`)
        }
    } catch (error) {
        console.error("Error updating order status:", error)
        res.status(500).send("Internal Server Error")
    }
}
const returnDelivery = async (req, res) => {
    const orderId = req.query.orderId
    const productItemId = req.params.id

    try {
        const order = await Order_line.findById(orderId)

        if (order) {
            // Get the index of the product item to be updated
            const index = order.Product_item_id.findIndex((id) =>
                id.equals(productItemId)
            )

            if (index !== -1) {
                // Construct the field path for the specific status to be updated
                const statusFieldPath = `Status.${index}`

                // Update the document to set the status to 'Shipped'
                await Order_line.updateOne(
                    { _id: orderId },
                    {
                        $set: {
                            [statusFieldPath]: "Returned",
                        },
                    }
                )

                res.redirect(`/user/orders/orderdetail/${orderId}`)
            } else {
                console.log("Failure 1: Product item not found in the order.")
                res.redirect(`/user/orders/orderdetail/${orderId}`)
            }
        } else {
            console.log("Failure 2: Order not found.")
            res.redirect(`/user/orders/orderdetail/${orderId}`)
        }
    } catch (error) {
        console.error("Error updating order status:", error)
        res.status(500).send("Internal Server Error")
    }
}

module.exports = {
    getLogin,
    getRegister,

    getLogout,
    createLogin,
    createRegister,
    forgotPassword,
    checkPassword,
    generateOTP,
    verifyOTP,
    registerMail,
    passwordOTP,
    passwordConfirm,
    newPassword,
    displayOTP,
    confirmPassword,
    userDetails,
    userUpdate,
    getAddress,
    newAddress,
    addNewAddress,
    deleteAddress,
    editAddress,
    updateAddress,
    setShipping,
    setBilling,
    getOrders,
    getOrderDetails,
    deleteOrder,
    getWallet,
    cancelItem,
    confirmDelivery,
    returnDelivery,
}
