const ChatDatabase = require('../database/ChatDatabase')
const GroupChatDatabase = require('../database/GroupChatDatabase')
const UserChatDatabase = require('../database/UserChatDatabase')
const SocketConstant = require('../ultil/SocketConstant')
let currentPage = 0
const ChatSocket = {
    listener: (io, socket, socketMap, fcm) => {
        socket.on(SocketConstant.JOIN_GROUP, async (data) => {
            try {
                console.log("JOIN_GROUP")
                const body = JSON.parse(data)
                const groupChat = await GroupChatDatabase.getGroupChatById(body.idGroupChat)
                for (const i in groupChat.idUsers) {
                    if (groupChat.idUsers[i].idUser === body.idUser) {
                        if (groupChat.idUsers[i].haveUnreadMessage) {
                            groupChat.idUsers[i].haveUnreadMessage = false
                            await GroupChatDatabase.updateGroupChat(groupChat)
                        }
                        const chatResult = await ChatDatabase.getChats(groupChat, body.page)
                        socket.emit(SocketConstant.SEND, JSON.stringify(chatResult))
                        console.log("chay qua emit JOIN_GROUP")
                        console.log("JOIN_GROUP" + socket)
                        return
                    }
                }
            } catch (e) {
                console.log("loi JOIN_GROUP" + e)
            }
        })

        socket.on(SocketConstant.RECEIVE, async data => {
            try {
                console.log("RECEIVE")
                const body = JSON.parse(data)
                const idUser = body.idUser
                const idGroupChat = body.idGroupChat
                const contentText = body.contentText
                const groupChat = await GroupChatDatabase.getGroupChatById(idGroupChat)
                const user = await UserChatDatabase.getUser(idUser)
                const chat = await ChatDatabase.addChat(idUser, groupChat, contentText)
                if (chat == null) return
                const chatRes = await ChatDatabase.getChats(groupChat, 0)
                for (const i in groupChat.idUsers) {
                    const item = groupChat.idUsers[i].idUser
                    const sockets = socketMap.get(item)
                    if (sockets != null) {
                        for (const j in sockets) {
                            sockets[j].emit(SocketConstant.SEND, JSON.stringify(chatRes))
                            sockets[j].emit(SocketConstant.LOGIN, JSON.stringify(await GroupChatDatabase.getGroupsOfUser(item, 0)))
                        }
                    } else if (item !== idUser) {
                        const message = {
                            to: `/topics/${item}`,
                            notification: {
                                title: `Tin nhắn mới`,
                                body: `${user.name}: ${contentText}`
                            },
                            android:{
                                priority:'high'
                            },
                            priority: 10
                        }
                        fcm.send(message, (err, res) => {
                        })
                    }
                }
            } catch (e) {
                console.log("loi RECEIVE" + e)
            }
        })
    }
}
module.exports = ChatSocket