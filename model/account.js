const mongoose = require('mongoose');
const accountSchema = new mongoose.Schema({
    phoneNumber: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: false
    },
    fullName: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        required: true
    },
    idToken: {
        type: Array,
        required: false
    },
    idPets: {
        type: Array,
        required: false
    },
    province: {
        type: String,
        required: false,
    },
    district: {
        type: String,
        required: false
    },
    commune: {
        type: String,
        required: false,
    },
    longitude: {
        type: Number,
        required: false
    },
    latitude: {
        type: Number,
        required: false
    },
    typeAccount: {
        type: Number,
        required: true
    },
    idUser: {
        type: String,
        required: false
    },
    idNews: {
        type: Array,
        required: false
    },
    idGroup: {
        type: Array,
        required: false,
    },
    idNotification:{
        type: Array,
        required: false
    },
    currentPet: {
        type: String,
        required: false
    },
    isShowUpdatePet:{
        type: Boolean,
        required: true,
    },
    isLocked: {
        type: Boolean,
        required: true,
    },
    dateLock:{
        type: Number,
        required: false,
    }
})
const Account = mongoose.model("account", accountSchema, "account");

module.exports = Account;