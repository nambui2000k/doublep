let dotenv = require('dotenv')
dotenv.config()


const SocketConstant = {
    RECEIVE:"SEND",
    SEND:"RECEIVE",
    NEW_GROUP:"NEW_GROUP",
    LOGIN:"LOGIN",
    JOIN_GROUP :"JOIN_GROUP",
    FCM_SERVER_KEY:"AAAAfstHgi4:APA91bEJ9BLB4rcMxXpMe4zcSzNa9XlhYX11oqK5jGbjoR1FurmliDejCNko7X51Xw6B5gLzxMKthrQzmHYi4R2P8zdeuHfXjVdVonk7OFmHsUPY-mHZq_7Bx2hnKJcc8DwMHBBKCl-N",
    RECEIVE_INVITE:"RECEIVE_INVITE",
    BASE_URL:(process.env.BASE_URL || "http://doublep.tk/"),
    JOIN_MAP:"JOIN_MAP",
    LEFT_MAP:"LEFT_MAP",
    MOVE_MAP:"MOVE_MAP",
    MAP_DATA:"MAP_DATA",
    ACTION_LOCK:"ACTION_LOCK"
}
console.log("base_url_socker:"+SocketConstant.BASE_URL)

module.exports = SocketConstant