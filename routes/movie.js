import express from 'express'

import Movie from '../models/Movie'
import Vote from '../models/Vote'

const router = express.Router()

router.get('', (req, res) => {
    const date = new Date()

    const month = req.query.month || date.getMonth()

    const firstDay = new Date(date.getFullYear(), month, 1)
    const lastDay = new Date(date.getFullYear(), month + 1, 0)

    Movie.aggregate([
        {
            $addFields: {
                date: {
                    $dateFromString: {
                        dateString: '$date_release'
                    }
                }
            }
        },
        { "$match": {
                "date": {
                    $gte: new Date(firstDay),
                    $lt: new Date(lastDay)
                }
            }
        }
    ]).then((movies, errors) => {
        if (req.decoded && req.decoded._id) {
            Vote.find({user_id: req.decoded._id, movie_id: { $in: movies.map((movie) => movie._id) } })
            .then((votes) => {
                const formattedMovies = movies.map((movie) => {
                    const index = votes.findIndex((vote) => JSON.stringify(vote.movie_id) === JSON.stringify(movie._id))

                    return {
                        ...movie,
                        hasVoted: index !== -1
                    }
                })

                return res.sjson({
                    status: 200,
                    data: formattedMovies
                })
            })
        } else {
            return res.sjson({
                status: 200,
                data: movies
            })
        }
    })
})

router.get('/qualifiedMovie', (req, res) => {
    const date = new Date()

    const month = req.query.month || date.getMonth()

    const firstDay = new Date(date.getFullYear(), month, 1)
    const lastDay = new Date(date.getFullYear(), month + 1, 0)

    Movie.aggregate([
        {
            $addFields: {
                date: {
                    $dateFromString: {
                        dateString: '$date_release'
                    }
                }
            }
        },
        {
            $match: {
                date: {
                    $gte: new Date(firstDay),
                    $lt: new Date(lastDay)
                }
            }
        }
    ]).then((movies, errors) => {
        Vote.find({movie_id: { $in: movies.map((movie) => movie._id) }})
        .then((votes, errors) => {

            return res.sjson({
                status: 200,
                data: movies.map((movie) => {

                    const filteredVotes = votes.filter((vote) => vote.movie_id.toString() === movie._id.toString())

                    const grade = filteredVotes.reduce((a, b) => a + b.grade, 0) / filteredVotes.length

                    return {
                        ...movie,
                        grade,
                    }
                }).sort((a, b) => a.grade < b.grade)[0]
            })
        })
    })
})

export default router
