const mongoose = require('mongoose');
const petSchema =new mongoose.Schema({
    avatar:{
        type: String,
        required: true,
    },
    sex:{
        type: Number,
        required: true,
    },
    color:{
      type: String,
      required: false,
    },
    weight:{
        type:Number,
        required: false,
    },
    height:{
        type:Number,
        required: false,
    },
    idBreed:{
        type:String,
        required: false,
    },
    birthday:{
        type: Number,
        required: true,
    },
    origin:{
      type:String,
      required: false,
    },
    idType:{
        type: String,
        required: true,
    },
    name:{
        type:String,
        required: true,
    },
    idOwner:{
        type:String,
        required: true,
    }

})
const Pet = mongoose.model("pet",petSchema,"pet");

module.exports=Pet;