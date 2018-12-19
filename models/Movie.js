import mongoose from 'mongoose'

const MovieSchema = mongoose.Schema({
    title: {type: String, required: true},
    date_release: {type: String, required: true},
    synopsis: {type: String, required: true},
    poster: {type: String, required: true},
    actors: {type: String, required: true},
    genres: {type: String, required: true},
    directors: {type: String, required: true},
})

export default mongoose.model('Movie', MovieSchema)
