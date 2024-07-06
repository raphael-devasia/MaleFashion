const findUserByEmail = require('../utils/database')
const User = require('../models/schema')

const isAuthenticatedUser = (req, res, next)=>{
if (req.session && req.session.user){
next()
} else{
res. redirect('/login')
}
}


const checkUserStatus = async (req, res, next) => {
    if (req.session.user) {
        console.log(req.session.user)
        try {
            const user = await User.findOne({ email: req.session.user })
            if (user && !user.is_active) {
                req.session.destroy((err) => {
                    if (err) {
                        console.error("Error destroying session:", err)
                    }
                    return res.redirect("/login")
                })
            } else {
                next()
            }
        } catch (err) {
            console.error("Error checking user status:", err)
            next(err)
        }
    } else {
        next()
    }
}

module.exports = { checkUserStatus, isAuthenticatedUser }