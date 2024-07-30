const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const dotenv = require("dotenv")
const User = require("../models/schema")
const Wallet = require("../models/wallet")

dotenv.config()

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
        },
        async (accessToken, refreshToken, profile, done) => {
            console.log(profile)
            try {
                let user = await User.findOne({
                    email: profile.emails[0].value,
                })

                if (!user) {
                    user = new User({
                        
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        email: profile.emails[0].value,
                    })
                   const registerData = await user.save()
                   console.log("User created with id: ", registerData._id)
                    await Wallet.create({
                        user_id: registerData._id,
                        Wallet_amount: 0,
                    })
                    
                }
                 

                return done(null, user)
            } catch (err) {
                return done(err, null)
            }
        }
    )
)

passport.serializeUser((user, done) => {
    done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id)
        done(null, user)
    } catch (err) {
        done(err, null)
    }
})


    