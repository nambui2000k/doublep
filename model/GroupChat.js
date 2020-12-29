const mongoose = require('mongoose')

const GroupChat = new mongoose.Schema({
    idUsers:{
        type:[Object],
        required:true
    },
    messageCount:{
        type:Number,
        required: false,
        default:0
    },
    lastMessage:{
        type:Object,
        required:false,
    },
    lastSentTime:{
        type:Number,
        required:false
    }
},{ versionKey: false })

module.exports = mongoose.model('GroupChat',GroupChat,'GroupChat')