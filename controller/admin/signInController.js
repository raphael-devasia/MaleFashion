const collection = require("../../models/adminSchema")
const userCollection = require("../../models/schema") 
const validator = require("validator")

//Login page Dispaly
const getLogin = (req, res) => {
    const isAdmin = true
    if (req.session.admin) {
        return res.redirect("/admin/home")
    }

    res.render("base", { isAdmin, access: "ADMIN" })
}
//Registration page dispaly

const getRegister = (req, res) => {
    const isAdmin = true
    if (req.session.admin) {
        return res.redirect("/admin/home")
    }

    res.render("userSignup", { isAdmin, access: "Admin" })
}
const createLogin = async (req, res) => {
    console.log(req.body)
    const isAdmin = true
    const { email, password } = req.body

    // Regular expression patterns for email and password validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/

    // Check if email matches the pattern
    if (!emailPattern.test(email)) {
        return res.render("base", { msg: "Invalid email format", isAdmin })
    }
   
    // Check if password matches the pattern
    if (!passwordPattern.test(password)) {
        return res.render("base", { msg: "Invalid password format", isAdmin })
    }
    try {
        // Check if email exists in database
        const checkUser = await collection.findOne({
            email: email,
            password: password,
        })
        // const user = data.find((user) => user.email === email)

        if (!checkUser) {
            return res.render("base", {
                msg: "Email or password is not valid",
                isAdmin,
            })
        } else {
            req.session.admin = email
            res.redirect("/admin/home")
        }

        // If both email and password are valid, set the user in session and redirect to home
    } catch (error) {
        return res.render("base", {
            msg: "An error occurred, please try again later",
            isAdmin,
        })
    }
}
//Registration

const createRegister = async (req, res) => {
    const isAdmin = true
    const userData = {
        name: req.body.fullName,
        user: req.body.userName,
        password: req.body.password,
        gender: req.body.inlineRadioOptions,
        phone: req.body.phone,
        email: req.body.email,
    }
 

    // const validationErrors = validateUserData(userData)

    // if (validationErrors) {
    //     console.log(validationErrors);
    //     return res.render("userSignup", { errors: validationErrors, userData })
    // }

    const existingUser = await collection.findOne({ user: userData.user })
    const existingphone = await collection.findOne({ phone: userData.phone })
    const existingemail = await collection.findOne({ email: userData.email })

    if (existingUser) {
        res.render("userSignup", {
            existmsg: "username already exists. Try with a new username",
        })
    } else if (existingphone) {
        res.render("userSignup", {
            existmsg:
                "phone number already exists. Try with a new phone number",
        })
    } else if (existingemail) {
        res.render("userSignup", {
            existmsg: "email already exists. Try with a new email address",
        })
    } else {
        const registerData = await collection.insertMany(userData)
        console.log("data inserted successfully", userData)
        setTimeout(() => {
            res.redirect("/admin/login")
        }, 2000) //
    }
}
//create user from admin panel!!!!
const newUserRegister = async (req, res) => {
    const isAdmin = true
    const userData = {
        name: req.body.fullName,
        user: req.body.userName,
        password: req.body.password,
        gender: req.body.gender,
        phone: req.body.phone,
        email: req.body.email,
    }


    const existingUser = await userCollection.findOne({ user: userData.user })
    const existingphone = await userCollection.findOne({
        phone: userData.phone,
    })
    const existingemail = await userCollection.findOne({
        email: userData.email,
    })

    const userDetails = await userCollection.find()

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
        const newRegisterData = await userCollection.insertMany(userData)
        console.log("data inserted successfully", userData)
        setTimeout(() => {
            req.flash("info", "User Added Successfully")
            return res.redirect("/admin/home")
        }, 2000) //
    }
}
//aAdmin panel Display

const getHome = async (req, res) => {
    const isAdmin = true
    if (req.session.admin) {
        const userDetails = await userCollection.find()

        return res.render("index", {
            data: userDetails,
            existmsg: req.flash("info"),
            searchTerm: req.flash("searchTerm"),
            searchData: req.flash("searchData"),
        })
    }

    res.redirect("/admin/login")
}

const deleteUser = async (req, res) => {
    const { id } = req.params
    const userDeletion = await userCollection.findByIdAndDelete(id)
    if (!userDeletion) {
        return res.status(404).json({ message: "User not found" })
    }
    const userDetails = await userCollection.find()
    console.log(userDetails)
    req.flash("info", "User deleted successfully!")
    return res.redirect("/admin/home")
}
//updating user in admin panel!!

const updateUser = async (req, res) => {
    const id = req.params.id
    const userData = {
        name: req.body.fullName,
        user: req.body.userName,
        password: req.body.password,
        gender: req.body.gender,
        phone: req.body.phone,
        email: req.body.email,
    }
    const updatedUserData = req.body
    console.log("updated user data ", updatedUserData)
    // Make sure that the required properties are included in the request body
    // if (
    //     !updatedUserData.fullName ||
    //     !updatedUserData.userName ||
    //     !updatedUserData.password ||
    //     !updatedUserData.gender ||
    //     !updatedUserData.phone ||
    //     !updatedUserData.email
    // ) {
    //     req.flash("info", "All fields are required")
    //     return res.redirect("/admin/home")
    // }
    console.log(id)
    const updatedUser = await userCollection.findByIdAndUpdate(id, userData, {
        new: true,
    })

    if (!updatedUser) {
        return res.status(404).json({ message: "User not found" })
    }

 
    req.flash("info", "User updated successfully!")
    return res.redirect("/admin/home")
}
//search Data
const searchData = async (req, res) => {
    const searchTerm = req.body.searchTerm
    const regex = new RegExp(searchTerm, "i") // create a case-insensitive regular expression

    const users = await userCollection.find({
        $or: [
            { name: { $regex: regex } },
            { email: { $regex: regex } },
            { user: { $regex: regex } },
        ],
    })
    console.log("No users found", users.length)

    if (users.length === 0) {
        req.flash("info", "NO MATCHES FOUND"),
            req.flash("searchTerm", searchTerm)
        res.redirect("/admin/home")
    } else {
        req.flash("searchTerm", searchTerm)
        req.flash("searchData", users)

        res.redirect("/admin/home")
    }
}
const getLogout = (req, res) => {
    const isAdmin = true
    req.session.admin= null

    res.redirect("/admin/login")
}
module.exports = {
    getLogin,
    getRegister,
    getHome,
    getLogout,
    createLogin,
    createRegister,
    newUserRegister,
    deleteUser,
    updateUser,
    searchData,
}
