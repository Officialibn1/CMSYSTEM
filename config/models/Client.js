const mongoose = require('mongoose')

const ClientSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    projectsID: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Project',
    },
    userUID: {
        type: String,
        ref: 'User',
        required: true,
    }
})

module.exports = mongoose.model('Client', ClientSchema)