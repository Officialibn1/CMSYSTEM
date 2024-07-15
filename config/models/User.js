const mongoose = require('mongoose')


const UserSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        uniqiue: true
    },
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    clients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    }]
})

module.exports = mongoose.model('User', UserSchema)