const express = require("express")
const app = express()
const path = require("path")
const session = require("express-session")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const nocache = require("nocache")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const { error } = require("console")
const collection = require("./models/schema")
var flash = require("connect-flash")
const fileUplaod= require('express-fileupload')
const passport = require('passport')
const morgan = require("morgan")
dotenv.config()

require("./middlewares/auth")
//Routes Admin ***

const adminRouter = require("./routes/admin/adminRoutes")
const productManageRoute = require("./routes/admin/productManageRoute")
const userManageRoute = require("./routes/admin/userManageRoutes")

//Routes User ***
const userRouter = require("./routes/user/userRoutes")
const productRouter = require('./routes/user/productRoutes')
// Use morgan to log requests to the console
app.use(morgan('dev'));
// Middleware to set the static page
app.use(express.static(path.join(__dirname, "public")))
const userStatic = express.static(path.join(__dirname, 'public', 'user'))

app.use('/', userStatic);

// Middleware to parse request bodies
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))

//setting the EJS view engine
app.set("view engine", "ejs")
// Middleware for parsing cookies and managing sessions
// Session configuration
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));
app.use(cookieParser())
// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
// Middleware for flashing messages
app.use(flash())

// Make flash messages available to all views
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});
// No-Cache middleware
app.use(nocache())

// Middleware for sessions
app.use(
    session({
        secret: "your-secret-key",
        resave: false,
        saveUninitialized: true,
    })
)
app.use(fileUplaod())
//Router setup
app.use("/", userRouter, productRouter)
app.use("/admin/", adminRouter, productManageRoute, userManageRoute)

app.get("/", (req, res) => {
    res.redirect("/login")
})
// Google OAuth routes
app.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: ["email", "profile"],
        prompt: "select_account",
    })
)

app.get('/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        req.session.user = req.user.email
        res.redirect('/home');
    }
);

//page not found
// 400 for user routes
app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/admin')) {
        next(); // Skip this middleware for admin routes
    } else {
        res.status(400).render('user/error_400');
    }
});

// 404 for admin routes
app.use('/admin', (req, res) => {
    res.status(400).render("error_400")
});





const port = process.env.PORT || 5050
const MONGOURL = process.env.MONGO_URI
//connect to mongo db
mongoose
    .connect(MONGOURL, {
        serverSelectionTimeoutMS: 60000, // Increase from default 30000
        socketTimeoutMS: 45000,
    })
    .then(() => {
        console.log("successfully connected to database")
        app.listen(port, () => {
            console.log(`Server is listening at port ${port} `)
        })
    })
    .catch((error) => {
        console.log("failed to connect to database", error)
    })
