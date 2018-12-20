import express from 'express'
import mongoose from 'mongoose'

import Movie from '../models/Movie'
import Vote from '../models/Vote'

const router = express.Router()

router.post('/multiples', (req, res) => {
    const potVotes = req.body.potVotes

    const errors = []

    Movie.find({_id: { $in: potVotes.map((vote) => vote.id)}})
    .then((movies, err) => {

        if (!movies) {
            return res.sjson({
                status: 400,
                errors: ['Movies not found']
            })
        }

        potVotes.forEach((vote) => {
            const index = movies.findIndex((movie) => JSON.stringify(movie._id) === vote.id)

            if(index === -1) {
                errors.push({id: movie._id, msg: 'Movie not found'})
            }
        })

        Vote.find({user_id: mongoose.Types.ObjectId(req.decoded._id), movie_id: { $in: movies.map((movie) => movie._id) }})
        .then((votes, err) => {

            const newVotes = []

            movies.forEach((movie) => {
                const index = (votes || []).findIndex((vote) => vote.movie_id === movie._id)

                if (index === -1) {
                    const newVote = potVotes.find((vote) => {
                        return JSON.stringify(mongoose.Types.ObjectId(vote.id)) === JSON.stringify(movie._id)
                    })

                    const categories = newVote.categories || []
                    const grade = newVote.grade || categories.reduce((a, b) => a + b.grade, 0) / categories.length

                    newVotes.push(new Vote({
                        user_id: mongoose.Types.ObjectId(req.decoded._id),
                        movie_id: movie.id,
                        grade,
                        categories,
                    }))
                } else {
                    errors.push({id: movie._id, msg: 'Already voted'})
                }
            })

            Vote.create(newVotes)
            .then((votes) => {
                res.sjson({
                    status: 200,
                    data: votes,
                    errors
                })
            })
        })
    })
})

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

        Vote.findOne({user_id: mongoose.Types.ObjectId(req.decoded._id), movie_id: movie._id})
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
