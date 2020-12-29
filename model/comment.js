const mongoose = require('mongoose');
const commentSchema =new mongoose.Schema({
    idOwner:{
        type: String,
        required: true,
    },
    idNews:{
        type: String,
        required: true,
    },
    timeCreated:{
        type: Number,
        required: true,
    },
    idReporters:{
      type: Array,
      required: false,
    },
    content:{
      type:  String,
        required: true,
    },
    isLocked:{
        type: Boolean,
        required: true,
    },
    dateLocked:{
        type: Number,
        required: false,
    }


})
const Comment = mongoose.model("comment",commentSchema,"comment");
module.exports=Comment;