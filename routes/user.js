import express from 'express'
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import { validationResult  } from 'express-validator/check'

import User from '../models/User'
import Vote from '../models/Vote'
import forms from '../forms/user'

const router = express.Router()

router.post('', forms.register, (req, res) => {
    const { username, password } = req.body

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.sjson({status: 422, errors: errors.array().map((error) => error.msg) })
    }

    User.findOne({username}, (err, user) => {
        if(err) throw err
        if (user) {
            return res.sjson({
                status: 400,
                errors: ['Username already in use']
            })
        }

        bcrypt.hash(password, 10, (err, hash) => {
            if(err) {
                return res.sjson({
                    status: 500,
                    errors: [err],
                })
            }
            else {
                new User({
                    username,
                    password: hash
                }).save().then((result) => {
                    res.sjson({
                        status: 200,
                        data: result
                    })
                }).catch(err => {
                    res.sjson({ status: 500, errors: [err] })
                })
            }
        })
    })
})

router.get('/:userId', (req, res) => {
    const userId = req.params.userId

    if (req.decoded._id !== userId) {
        return res.sjson({
            status: 403,
            errors: ['Unauthorized access']
        })
    }

    User.findOne({_id: mongoose.Types.ObjectId(userId)})
    .then((user, err) => {
        if (err) throw err

        if (!user) {
            return res.sjson({
                status: 400,
                errors: ['User not found']
            })
        }

        Vote.find({user_id: user._id})
        .then((votes, err) => {
            return res.sjson({
                status: 200,
                data: {...user._doc, votes}
            })
        })

    })
})

export default router
