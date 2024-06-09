const collection = require("../models/schema")
const GoogleUser = require("../models/googleUser")
const Product_category = require('../models/productSchema')
const ProductImage = require("../models/productImage")
const otpGenerator = require('otp-generator')
const {
    MailGenerator,
    transporter,
    
} = require("../controller/mailer")
require("../middlewares/auth")
const path = require("path")
const Size_category = require("../models/sizeCategorySchema")
const Product = require("../models/products")
const ProductItem = require("../models/product_item")
const ProductVariation = require("../models/productVariation")
const SizeOption = require("../models/sizeSchema")
const Colours = require("../models/colorSchema")
const { log } = require("console")
const passport =require("passport")



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
       console.log(isActive);

        if (!checkUser) {
            return res.render("base", {
                msg: "Email or password is not valid",
                isAdmin,
            })
                 
            
        }else if (!isActive) {
 return res.render("base", {
     msg: "Admin Blocked you From Accessing the Website",
     isAdmin,
 })

        } else {
            req.session.user = email
            res.redirect("/home")
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
    if (req.session.user) {
        return res.redirect("/home")
    }
const userSuccess = req.flash("info")

res.render("user/register", {
    isAdmin,
    access: "User",
    userSuccess: userSuccess.length > 0 ? userSuccess[0] : null,
    adminVarify: req.flash("admin"),
})
}
//========>>>>>> ###### POST : http://localhost:5050/register/generateOTP ######


const generateOTP = async (req,res)=>{
    const userEmail = req.body.userEmail 
    console.log(userEmail)
const existingUser = await collection.findOne({email:userEmail})
if (existingUser){
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

 // send mail
 transporter
     .sendMail(message)
     .then(() => {
         return res.status(200).render("user/OTPvalidation", {
             OTP: req.app.locals.OTP,
             userEmail,
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
    console.log(`the email is ${email}`);
    if (parseInt(req.app.locals.OTP) === parseInt(code)) {
        req.app.locals.OTP = null
        req.app.resetSession = true
        return res.render("userSignup", {
            email:email
        })
    } else {
        return res.render("user/OTPvalidation", {
            msg: "Invalid OTP!",
            userEmail: email,
        })
    }
}




//========>>>>>> ###### POST : http://localhost:5050/register ######

const createRegister = async (req, res) => {
    const isAdmin = false
    const userData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: req.body.password,
        
        phone: req.body.phone,
        email: req.body.email,
    }
    console.log(userData);

    // const validationErrors = validateUserData(userData)

    // if (validationErrors) {
    //     console.log(validationErrors);
    //     return res.render("userSignup", { errors: validationErrors, userData })
    // }

    // const existingUser = await collection.findOne({ user: userData.user })
    // const existingphone = await collection.findOne({ phone: userData.phone })
    // const existingemail = await collection.findOne({ email: userData.email })

    // if (existingUser) {
    //     res.render("userSignup", {
    //         existmsg: "username already exists. Try with a new username",
    //         isAdmin,
    //     })
    // } else if (existingphone) {
    //     res.render("userSignup", {
    //         existmsg:
    //             "phone number already exists. Try with a new phone number",
    //         isAdmin,
    //     })
    // } else if (existingemail) {
    //     res.render("userSignup", {
    //         existmsg: "email already exists. Try with a new email address",
    //         isAdmin,
    //     })
    // } else {
        const registerData = await collection.insertMany(userData)
        // console.log('registration successfulllll');
        // req.flash("info", "New User Added Successfully")
        // req.flash("admin",isAdmin)
        setTimeout(() => {
            res.redirect("/")
        }, 2000) //
    
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
    req.session.destroy()

    res.redirect("/")
}

//========>>>>>> ###### GET : http://localhost:5050/forgot-password ######
const forgotPassword = async (req,res)=>{
    const userSuccess = req.flash("info")
    res.render('user/forgot',{userSuccess: userSuccess.length > 0 ? userSuccess[0] : null})
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
 const passwordOTP= async(req,res)=>{
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
 const passwordConfirm = async (req,res)=>{
    const code = req.body.otp
    const email = req.body.userEmail
    console.log(code);
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

 const displayOTP = async (req,res)=>{
    res.render("user/OTPvalidation", {
        msg: req.flash("msg"),
        userEmail: req.flash("userEmail"),
        passwordReset:true,
    })
 }
 const confirmPassword = async (req,res)=>{
     const msg = req.flash("msg") // Retrieve flash message
     res.render("user/password", {
         email: req.flash("email"),
         msg:msg[0],
     })
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
    
}
