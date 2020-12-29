const mongoose = require('mongoose')

const Invite = new mongoose.Schema({
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    sentTime: {
        type: Number,
        required: false
    }
}, {versionKey: false})

module.exports = mongoose.model('Invite', Invite, 'Invite')