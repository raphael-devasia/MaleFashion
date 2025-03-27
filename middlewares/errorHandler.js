const errorHandler = (err, req, res, next) => {
    console.error(err.stack)
    const statusCode = err.statusCode || 500
    res.status(statusCode).json({
        message: err.message || "Something went wrong!",
        status: err.status || "error",
    })
}

module.exports = errorHandler
