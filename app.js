import 'colors'
import morgan from 'morgan'
import express from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import cors from 'cors'

import userRouter from './routes/user'
import authRouter from './routes/auth'

dotenv.config()

const app = express()

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(bodyParser.json())

app.use(cors())

function authChecker(req, res, next) {
    const token = req.body.token || req.headers['x-access-token']

    if (req.url === '/api/auth' || req.url === '/api/user') {
        return next()
    }


    if (token) {
        jwt.verify(token, process.env.SECRET, (err, decoded) => {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' })
            }
            req.decoded = decoded
            next()
        })
    } else {
        res.redirect('/api/auth')
    }
}

app.use(authChecker)

app.use((req, res, next) => {
    res.sjson = (data) => {
        res.status(data.status).json(data)
    }

    return next()
})

app.use('/api/user', userRouter)
app.use('/api/auth', authRouter)

export default app
