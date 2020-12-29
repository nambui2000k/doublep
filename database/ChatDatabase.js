const Chat = require('../model/Chat')
const UserDatabase = require('../database/UserChatDatabase')
const GroupChatDatabase = require('../database/GroupChatDatabase')
const SocketConstant = require('../ultil/SocketConstant')

const ChatDatabase = {
    addChat: async (idUser, groupChat, contentText) => {
        const user = await UserDatabase.getUser(idUser)
        if (user == null) {
            return null
        }
        if (groupChat == null) {
            return null
        }
        if (contentText == null || contentText.length === 0) return null
        const chat = new Chat({
            idUser: idUser,
            idGroupChat: groupChat._id,
            contentText: contentText,
            time: new Date().getTime()
        })
        const chatResult = await chat.save()
        groupChat.messageCount++
        groupChat.lastMessage = chat
        for (const i in groupChat.idUsers){
            if (groupChat.idUsers[i].idUser !== idUser){
                groupChat.idUsers[i].haveUnreadMessage = true
            }
        }
        await GroupChatDatabase.updateGroupChat(groupChat)
        return chatResult
    },
    getChats: async (groupChat, page) => {
        const perPage = 20
        const chats = await Chat.find({idGroupChat:groupChat._id}).limit(perPage).skip(page * perPage).sort({time: -1}).lean()
        const count = await Chat.find({idGroupChat:groupChat._id}).countDocuments()
        const dataRes =[]
        for (const i in chats){
            const item = chats[i]
            const user = await UserDatabase.getUser(item.idUser)
            delete item.idUser
            const userRes = {_id:user.idUser,name:user.name,avatar:user.avatar,isOnline:user.isOnline}
            item.user = userRes
            if (item.attachmentFile!=null){
                for (const j in item.attachmentFile){
                    item.attachmentFile[j] = `${SocketConstant.BASE_URL}${item.attachmentFile[j]}`
                }
            }
            dataRes.push(item)
        }
        groupChat.haveUnreadMessage = false
        await GroupChatDatabase.updateGroupChat(groupChat)
        const result = {pages: Math.ceil(count / perPage), currentPage: page, data: dataRes}
        return result
    },
    addChatTypeFile:async (idUser, groupChat, fileNames) => {
        const user = await UserDatabase.getUser(idUser)
        if (user == null) {
            return null
        }
        if (groupChat == null) {
            return null
        }
        if (fileNames == null || fileNames.length === 0) return null
        const fileData =[]
        for (const i in fileNames){
            fileData.push(`message/${fileNames[i]}`)
        }
        const chat = new Chat({
            idUser: idUser,
            idGroupChat: groupChat._id,
            contentText: "",
            time: new Date().getTime(),
            attachmentFile:fileData
        })
        const chatResult = await chat.save()
        groupChat.messageCount++
        groupChat.lastMessage = chat
        for (const i in groupChat.idUsers){
            if (groupChat.idUsers[i].idUser !== idUser){
                groupChat.idUsers[i].haveUnreadMessage = true
            }
        }
        await GroupChatDatabase.updateGroupChat(groupChat)
        return chatResult
    }
}

module.exports = ChatDatabase