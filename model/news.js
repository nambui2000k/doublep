const mongoose = require('mongoose');
const newsSchema =new mongoose.Schema({
    idOwner:{
        type: String,
        required: true,
    },
    timeCreated:{
        type: Number,
        required: true,
    },
    content:{
      type: String,
      required: false,
    },
    images:{
        type: Array,
        required: true,
    },
    favoritePersons:{
        type: Array,
        required: false,
    },
    idComments:{
        type: Array,
        required: false,
    },
    idReporters:{
        type: Array,
        required: false,
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
const News = mongoose.model("news",newsSchema,"news");
module.exports=News;