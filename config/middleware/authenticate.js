const { getAuth } = require('firebase-admin/auth');

const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        req.user = null

        return next()
    }

    const token = authHeader.split('Bearer ')[1]


    // console.log('authHeader: ', JSON.stringify(authHeader));

    // console.log('token: ', JSON.stringify(token));

    if (!token) {
        req.user = null

        return next()
    }

    try {
        const decodedToken = getAuth().verifyIdToken(token)

        req.user = decodedToken

        next()

    } catch (error) {
        console.error('Error Verifying User', error)

        req.user = null

        next()
    }
}

module.exports = authenticate