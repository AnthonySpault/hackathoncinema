import mongoose from 'mongoose'

const VoteSchema = mongoose.Schema({
    grade: {type: Number, required: true},
    user_id: {type: String, required: true, ref: 'User'},
    movie_id: {type: String, required: true, ref: 'Movie'},
    categories: [
        {
            criteria: { type: String },
            grade: { type: Number },
        }
    ],
})

export default mongoose.model('Vote', VoteSchema)
