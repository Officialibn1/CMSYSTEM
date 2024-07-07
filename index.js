// https://cloud.hasura.io/public/graphiql?endpoint=http%3A%2F%2Flocalhost%3A5000%2Fgraphql

const express = require('express')

const colors = require('colors')

const { createHandler } = require("graphql-http/lib/use/express")

const schema = require('./schema/rootSchema')

const connectDB = require('./config/db')

const cors = require('cors')

require('dotenv').config()

const port = process.env.PORT || 5000

const app = express()

connectDB()

app.use(cors())

app.use(
    '/graphql',
    createHandler({
        schema,
    })
)

app.listen(port, console.log(`SERVER RUNNING ON PORT: http://localhost:${port}`))

