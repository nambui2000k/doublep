const mongoose = require('mongoose')

const UserChat = new mongoose.Schema({
    idUser: {
        type: String,
        required: true
    },
    groupCount: {
        type: Number,
        required: false,
        default: 0
    },
    idDevice: {
        type: [String],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    isOnline: {
        type: Boolean,
        required: false,
        default: false
    },
    timeLeft: {
        type: Number,
        required: false
    }
}, {versionKey: false})

module.exports = mongoose.model('UserChat', UserChat, 'UserChat')