const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const { readdirSync } = require('fs')
const app = express()
const port = '3000'

// Middleware
app.use(cors())
app.use(morgan('dev'))

// Routes
readdirSync('./routes').map((route) => {
  app.use('/api', require('./routes/' + route))
})

app.listen(3000, () => {
  console.log('Server is running on port', port)
})

