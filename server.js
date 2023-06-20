const express = require('express')
const app = express()
const cors = require('cors')

app.use(express.json())
app.use(cors())

const itemRouter = require('./contorller/item')
const userRouter = require('./contorller/user')

const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200 
}

app.use('/item', cors(corsOptions), itemRouter)
app.use(cors(corsOptions),userRouter)


app.listen(5000, () => console.log('Server is running port 5000.....'))