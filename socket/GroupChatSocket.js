const Constant = require('../ultil/SocketConstant')
const GroupChatDatabase = require('../database/GroupChatDatabase')
const UserDatabase = require('../database/UserChatDatabase')

const GroupChatSocket = {
    listener: (io, socket, socketMap, fcm) => {
        // socket.on(Constant.NEW_GROUP, async (data) => {
        //     try {
        //         const body = JSON.parse(data)
        //         let idUsers = body.idUsers
        //         if (Array.isArray(idUsers)) {
        //             idUsers.push(body.idUser)
        //             idUsers = [...new Set(idUsers)]
        //             await GroupChatDatabase.addGroup(body.idUser,idUsers)
        //         }
        //     } catch (e) {
        //         console.log(e)
        //     }
        // })

    },
    addGroup:async (idUser,idUsers, socketMap, fcm)=>{
        const group = await GroupChatDatabase.addGroup(idUsers)
        const user = await UserDatabase.getUser(idUser)
        if (group != null) {
            for (const i in idUsers) {
                const sockets = socketMap.get(idUsers[i])
                if (sockets) {
                    for (const j in sockets) {
                        sockets[j].emit(Constant.LOGIN, JSON.stringify(await GroupChatDatabase.getGroupsOfUser(idUsers[i], 0)))
                    }
                } else if (idUsers[i] !== idUser) {
                    const message = {
                        to: `/topics/${idUsers[i]}`,
                        notification: {
                            title: `Lời mời ghép đôi`,
                            body: `${user.name} đã đồng kết nối chọn giống với bạn`
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
    }
}

module.exports = GroupChatSocket