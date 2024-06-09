const collection = require("../../models/adminSchema")
const userCollection = require("../../models/schema")
const GoogleUser = require('../../models/googleUser')
// Get Users
const getUsers = async (req, res) => {
    const isAdmin = true
    if (req.session.admin) {
        try {
            
            const [userDetails, googleUsers] = await Promise.all([
                userCollection.find(),
                GoogleUser.find(),
            ])

            return res.render("userlist", {
                data: {
                    userDetails: userDetails,
                    googleUsers: googleUsers,
                },
                existmsg: req.flash("info"),
                searchTerm: req.flash("searchTerm"),
                searchData: req.flash("searchData"),
            })
        } catch (error) {
            // Handle any errors that occur during fetching
            console.error("Error fetching user details:", error)
            // Render an error page or redirect as needed
            // For example:
            res.render("error", {
                error: "An error occurred while fetching user details.",
            })
        }
    }

    res.redirect("/admin/login")
}

// Add Users
const addUser = async (req, res) => {
    const isAdmin = true
    if (req.session.admin) {
        const userDetails = await userCollection.find()

        return res.render("adduser", {
            data: userDetails,
            existmsg: req.flash("info"),
            searchTerm: req.flash("searchTerm"),
            searchData: req.flash("searchData"),
        })
    }

    res.redirect("/admin/login")
}
// Edit Users
const editUser = async (req, res) => {
    const isAdmin = true
    if (req.session.admin) {
        const userDetails = await userCollection.find()

        return res.render("edituser", {
            data: userDetails,
            existmsg: req.flash("info"),
            searchTerm: req.flash("searchTerm"),
            searchData: req.flash("searchData"),
        })
    }

    res.redirect("/admin/login")
}
////Upadate user Status

const updateUserStatus = async (req, res) => {
    console.log("Update started")

    try {
        const { userId } = req.params

        // Find the current user document
        const user = await userCollection.findById(userId)
        const googleUser = await GoogleUser.findById(userId)

        // Determine the new is_active value based on the existing values
        const currentIsActive = user
            ? user.is_active
            : googleUser
            ? googleUser.is_active
            : true
        const newIsActiveValue = !currentIsActive

        console.log("Current is_active:", currentIsActive)
        console.log("New is_active:", newIsActiveValue)

        // Update user status in the main user collection
        const userUpdatePromise = userCollection.findByIdAndUpdate(
            userId,
            { $set: { is_active: newIsActiveValue } },
            { new: true }
        )

        // Update user status in the GoogleUser collection
        const googleUserUpdatePromise = GoogleUser.findByIdAndUpdate(
            userId,
            { $set: { is_active: newIsActiveValue } },
            { new: true }
        )

        const [updatedUser, updatedGoogleUser] = await Promise.all([
            userUpdatePromise,
            googleUserUpdatePromise,
        ])

        // Check if either user is updated successfully
        if (updatedUser || updatedGoogleUser) {
            return res
                .status(200)
                .json({ message: "User status updated successfully" })
        } else {
            return res
                .status(404)
                .json({ message: "User not found in either collection" })
        }
    } catch (error) {
        // Handle errors
        console.error("Error updating user status:", error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

module.exports = {
    getUsers,
    addUser,
    editUser,
    updateUserStatus,
}
