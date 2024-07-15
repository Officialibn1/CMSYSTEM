
const admin = require('firebase-admin')

const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization

    if (!authHeader) {
        req.user = null

        return next()
    }

    const token = authHeader.split('Bearer ')[1]




    if (!token) {
        req.user = null

        console.log(null);

        return next()
    }

    try {
        const decodedAdminToken = await admin.auth().verifyIdToken(token);


        // console.log('decodedAdminToken: ', decodedAdminToken);

        req.user = decodedAdminToken

        next()

    } catch (error) {
        console.error('Error Verifying User', error)

        req.user = null

        next()
    }
}

module.exports = authenticate