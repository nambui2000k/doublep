const UserChat = require('../model/UserChat')

const UserChatDataBase = {
    addUser: async (data)=>{
        const userChat = new UserChat(data)
        await userChat.save()
    },
    getUser: async (idUser)=>{
        if (idUser==null) return null
        return await UserChat.findOne({idUser: idUser}).lean()
    },
    updateUser: async (data)=>{
        if (data ==null) return
        const  idUser = data.idUser
        if (idUser==null) return
        return await UserChat.findOneAndUpdate({idUser:idUser},data).lean()
    },
    getUserByIdsArray:async (idUsers)=>{
        return await  UserChat.find({_id:{'$in':idUsers}}).lean()
    }
}

module.exports = UserChatDataBase