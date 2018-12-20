import express from 'express'

import Movie from '../models/Movie'

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
        return res.sjson({
            status: 200,
            data: movies
        })
    })
})

export default router
