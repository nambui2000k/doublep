const mongoose = require('mongoose');
const typePetSchema =new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    idBreeds:{
        type: Array,
        required: true,
    },
    description:{
        type: String,
        required: false,
    }
});
const TypePet = mongoose.model("typepet",typePetSchema,"typepet");
module.exports=TypePet;