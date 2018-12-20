import express from 'express'
import mongoose from 'mongoose'

import Movie from '../models/Movie'
import Vote from '../models/Vote'

const router = express.Router()

router.post('/:movieId', (req, res) => {
    const movieId = req.params.movieId
    
    Movie.findOne({_id: mongoose.Types.ObjectId(movieId)})
    .then((movie, err) => {
        if (!movie) {
            return res.sjson({
                status: 400,
                errors: ['Movie Not Found']
            })
        }

        Vote.findOne({user_id: mongoose.Types.ObjectId(req.decoded._id)})
        .then((vote, err) => {
            if (vote) {
                return res.sjson({
                    status: 403,
                    errors: ['You already voted for that movie']
                })
            }

            const categories = req.body.categories || []
            const grade = req.body.grade || categories.reduce((a, b) => a + b.grade, 0) / categories.length

            new Vote({
                user_id: mongoose.Types.ObjectId(req.decoded._id),
                movie_id: movie.id,
                grade,
                categories,
            }).save((err, vote) => {
                if (err) throw err
                res.sjson({
                    status: 200,
                    data: vote
                })
            })

        })

    })
})

export default router
