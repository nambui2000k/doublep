const mongoose = require('mongoose')

const Chat = new mongoose.Schema({
    idUser: {
        type: String,
        required: true
    },
    idGroupChat: {
        type: String,
        required: true
    },
    contentText: {
        type: String,
        required: false
    },
    attachmentFile: {
        type: Array,
        required: false
    },
    attachmentFileType: {
        type: Number,
        default: 0,
        required: false
    },
    time: {
        type: Number,
        required: true,
        default: new Date().getTime()
    },
    deleted: {
        type: Boolean,
        required: false,
        default: false
    }
}, {versionKey: false})

module.exports = mongoose.model('Chat', Chat, 'Chat')