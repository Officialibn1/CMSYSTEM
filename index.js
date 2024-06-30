const express = require('express')

const { createHandler } = require("graphql-http/lib/use/express")

require('dotenv').config()

const port = process.env.PORT || 5000

const app = express()

app.listen(port, console.log(`SERVER RUNNING ON PORT: ${port}`))

