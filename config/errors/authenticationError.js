class AuthenticationError extends Error {
    constructor(message = 'Authentication Required') {
        super(message)

        this.name = 'Authentication Error'

        this.code = 'UNAUTHENTICATED'

        this.status = 401

    }
}

module.exports = { AuthenticationError }