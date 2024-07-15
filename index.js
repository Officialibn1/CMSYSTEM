// https://cloud.hasura.io/public/graphiql?endpoint=http%3A%2F%2Flocalhost%3A5000%2Fgraphql


const express = require('express')

const colors = require('colors')

// const { createHandler } = require("graphql-http/lib/use/express")

const { ApolloServer } = require('@apollo/server')

const { expressMiddleware } = require('@apollo/server/express4')

const schema = require('./schema/rootSchema')

const connectDB = require('./config/db')

const cors = require('cors')

require('dotenv').config()

const serviceAccountKey = require('./config/serviceAccountKey.json')

const admin = require('firebase-admin');

const authenticate = require('./config/middleware/authenticate.js')

const { AuthenticationError } = require('./config/errors/authenticationError.js')

colors.enable();


const port = process.env.PORT || 5000
const app = express()


connectDB()

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
})

app.use(cors())
app.use(express.json())
app.use(authenticate)

const server = new ApolloServer({
    schema,
    formatError: (err) => {
        if (err.originalError instanceof AuthenticationError) {
            return {
                message: err.message,
                extensions: {
                    code: err.originalError.code,
                    status: err.originalError.status
                }
            }
        }

        return {
            message: err.message,
            extensions: {
                code: 'INTERNAL_SERVER_ERROR',
                status: 500
            }
        }
    }
})

async function startServer() {
    await server.start()

    app.use(
        '/graphql',
        expressMiddleware(server, {
            context: async ({ req }) => {
                return { user: req.user }
            }
        })
    )

    app.listen(port, console.log(`SERVER RUNNING ON PORT: http://localhost:${port}`))
}

startServer()


// app.use(
//     '/graphql',
//     createHandler({
//         schema,
//         context: (req) => ({ user: req.user }),
//         formatError: (err) => {
//             if (err.originalError instanceof AuthenticationError) {
//                 return {
//                     message: err.message,
//                     extensions: {
//                         code: err.originalError.code,
//                         status: err.originalError.status
//                     }
//                 }
//             }

//             return {
//                 message: err.message,
//                 extensions: {
//                     code: 'INTERNAL_SERVER_ERROR',
//                     status: 500
//                 }
//             }
//         }
//     })
// )



