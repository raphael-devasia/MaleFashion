
const nodemailer = require("nodemailer")
const Mailgen = require("mailgen")
const dotenv = require("dotenv")
dotenv.config()

const nodeConfig = {
    service: "gmail",
   
    auth: {
        user: process.env.EMAIL, // generated ethereal user
        pass: process.env.PASSWORD, // generated ethereal password
    },
}
const transporter = nodemailer.createTransport(nodeConfig)

const MailGenerator = new Mailgen({
    theme: "default",
    product: {
        name: "Mailgen",
        link: "https://mailgen.js/",
    },
})

module.exports = { MailGenerator, transporter}