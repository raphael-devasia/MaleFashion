const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const dotenv = require("dotenv")
const User = require("../models/googleUser")

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
                let user = await User.findOne({ _id: profile.id })

                if (!user) {
                    user = new User({
                        _id: profile.id,
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        email: profile.emails[0].value,
                    })
                    await user.save()
                    
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


    