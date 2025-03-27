const path = require("path")
const fs = require("fs").promises

async function saveImage(base64Data, uploadDirectory) {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
    if (!matches || matches.length < 3) {
        throw new Error("Invalid base64 string")
    }

    const contentType = matches[1]
    const buffer = Buffer.from(matches[2], "base64")
    const filename = `image_${Date.now()}.${contentType.split("/")[1]}`
    const imagePath = path.join(uploadDirectory, filename)

    await fs.writeFile(imagePath, buffer)
    return `/assets/img/product/${path.basename(imagePath)}`
}

module.exports = { saveImage }
