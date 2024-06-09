const userCollection = require("../models/schema")
const express = require("express")
const app = express()
const flash = require("connect-flash")

// Add flash middleware to your app
app.use(flash())

async function authentication(req, res, next) {
    const isAdmin = true
    console.log(req.body.fullName)
    // Make sure that the required properties are included in the request body
    if (
        !req.body.fullName ||
        !req.body.userName ||
        !req.body.password ||
        !req.body.gender ||
        !req.body.phone ||
        !req.body.email
    ) {
        req.flash("info", "All fields are required")
        return res.redirect("/admin/home")
    }
    console.log(req.params.id)
    const userData = {
        name: req.body.fullName,
        user: req.body.userName,
        password: req.body.password,
        gender: req.body.gender,
        phone: req.body.phone,
        email: req.body.email,
    }

    const existingUser = await userCollection.findOne({
        user: userData.user,
        _id: { $ne: req.params.id },
    })

    const existingphone = await userCollection.findOne({
        phone: userData.phone,
        _id: { $ne: req.params.id },
    })

    const existingemail = await userCollection.findOne({
        email: userData.email,
        _id: { $ne: req.params.id },
    })

    if (existingUser) {
        req.flash("info", "username already exists. Try with a new username")
        return res.redirect("/admin/home")
    } else if (existingphone) {
        req.flash(
            "info",
            "Phone number already exists. Try with a new Phone number"
        )
        return res.redirect("/admin/home")
    } else if (existingemail) {
        req.flash("info", "Email already exists. Try with a new Email")
        return res.redirect("/admin/home")
    } else {
        // const newRegisterData = await userCollection.insertMany(userData)
        console.log("hi")
    }

    // Proceed to the next middleware function
    next()
}

module.exports = authentication
