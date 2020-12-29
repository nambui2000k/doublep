const mongoose = require('mongoose');
const notificationSchema =new mongoose.Schema({
    content:{
        type: String,
        required: true,
    },
    typeNotification:{
        type: Number,
        required: true,
    },
    timeCreated:{
        type: Number,
        required: true,
    },
    isRead:{
        type:Boolean,
        required: true,
    },
    idDetail:{
        type:String,
        required: false,
    },
    nameUserLastModify:{
        type:String,
        required: false,
    },
    avatar:{
        type:String,
        required: false,
    },
    idOwner:{
        type:String,
        required: true,
    },

})
const Notification = mongoose.model("notification",notificationSchema,"notification");

module.exports=Notification;