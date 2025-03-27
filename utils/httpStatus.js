// utils/httpStatus.js
const HttpStatus = Object.freeze({
    // 2xx Success
    OK: 200, // Request succeeded
    CREATED: 201, // Resource successfully created
    ACCEPTED: 202, // Request accepted for processing
    NO_CONTENT: 204, // Request succeeded, no content to return

    // 3xx Redirection
    MOVED_PERMANENTLY: 301, // Resource moved permanently
    FOUND: 302, // Resource found (temporary redirect)
    SEE_OTHER: 303, // Redirect to another URI (e.g., after POST)
    NOT_MODIFIED: 304, // Resource not modified (e.g., caching)
    TEMPORARY_REDIRECT: 307, // Temporary redirect
    PERMANENT_REDIRECT: 308, // Permanent redirect

    // 4xx Client Errors
    BAD_REQUEST: 400, // Invalid request syntax or parameters
    UNAUTHORIZED: 401, // Authentication required
    FORBIDDEN: 403, // Access denied
    NOT_FOUND: 404, // Resource not found
    METHOD_NOT_ALLOWED: 405, // HTTP method not allowed
    CONFLICT: 409, // Request conflicts with current state
    GONE: 410, // Resource no longer available
    TOO_MANY_REQUESTS: 429, // Rate limit exceeded

    // 5xx Server Errors
    INTERNAL_SERVER_ERROR: 500, // Generic server error
    NOT_IMPLEMENTED: 501, // Server doesn’t support the functionality
    BAD_GATEWAY: 502, // Invalid response from upstream server
    SERVICE_UNAVAILABLE: 503, // Server temporarily unavailable
    GATEWAY_TIMEOUT: 504, // Upstream server didn’t respond in time
})

module.exports = HttpStatus
