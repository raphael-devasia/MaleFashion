// utils/s3.js
const {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} = require("@aws-sdk/client-s3")
const path = require("path")

const s3Client = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
})

const uploadToS3 = async (file, key) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key, // File path in S3 (e.g., "category/Metavite_final.jpg")
        Body: file.data, // Buffer from express-fileupload
        ContentType: file.mimetype, // MIME type (e.g., "image/jpeg")
       
    }

    try {
        const command = new PutObjectCommand(params)
        await s3Client.send(command)
        return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${key}`
    } catch (error) {
        throw new Error(`Failed to upload to S3: ${error.message}`)
    }
}
const deleteFromS3 = async (key) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
    }

    try {
        const command = new DeleteObjectCommand(params)
        await s3Client.send(command)
        console.log(`Successfully deleted ${key} from S3`)
    } catch (error) {
        throw new Error(`Failed to delete from S3: ${error.message}`)
    }
}

module.exports = { s3Client, uploadToS3, deleteFromS3 }
