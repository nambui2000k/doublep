const ChatDatabase = require('../database/ChatDatabase')
const GroupChatDatabase = require('../database/GroupChatDatabase')
const SocketConstant = require('../ultil/SocketConstant')
const UserChatDatabase = require('../database/UserChatDatabase')

const throwError = (res) => {
    res.status(400).send({message: "error bad request"})
}
const ChatAPI = {
    create: (app, upload, socketMap, fcm) => {
        app.post('/api/chat/send_message', upload.array('attachmentFile', 3), async (req, res) => {
            const body = req.body
            if (body == null) {
                throwError(res)
                return
            }
            const idUser = body.idUser
            const idGroupChat = body.idGroupChat
            const groupChat = await GroupChatDatabase.getGroupChatById(idGroupChat)
            const fileNames = []
            for (const i in req.files) {
                fileNames.push(req.files[i].filename)
            }
            const chat = await ChatDatabase.addChatTypeFile(idUser, groupChat, fileNames)
            if (chat == null) {
                throwError(res)
            } else {
                res.status(200).send(chat)
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
                        const user = await UserChatDatabase.getUser(idUser)
                        const message = {
                            to: `/topics/${item}`,
                            notification: {
                                title: `Tin nhắn mới`,
                                body: `${user.name} đã gửi ${groupChat.lastMessage.attachmentFile.length} ảnh`
                            },
                            android:{
                                priority:"high"
                            },
                            priority: 10
                        }
                        fcm.send(message, (err, res) => {
                        })
                    }
                }
            }
        })

        app.post("/api/chat/get_message", upload.none(), async (req, res) => {
            const groupChat = await GroupChatDatabase.getGroupChatById(req.body.idGroupChat)
            const result = await ChatDatabase.getChats(groupChat, req.body.page)
            res.status(200).send(result)
        })
    }

}
module.exports = ChatAPI