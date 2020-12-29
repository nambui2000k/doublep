const GroupChat = require('../model/GroupChat')
const UserChatDatabase = require('../database/UserChatDatabase')
const SocketConstant = require('../ultil/SocketConstant')
const GroupChatDatabase = {
    addGroup: async (idUsers) => {
        const users = []
        const usersResult = []
        const idUsersSetter = []
        if (idUsers.length === 1) return null
        for (const index in idUsers) {
            const user = await UserChatDatabase.getUser(idUsers[index])
            if (user == null) {
                return null
            }
            user.groupCount++
            users.push(user)
            usersResult.push({idUser: user.idUser, name: user.name, avatar: user.avatar})
            idUsersSetter.push({idUser: user.idUser, haveUnreadMessage: false})
        }

        let existGroupChat = await GroupChatDatabase.getSpecificGroupChat(idUsers)
        if (existGroupChat == null) {
            existGroupChat = new GroupChat({idUsers: idUsersSetter})
            await existGroupChat.save()
            for (const index in users) {
                await UserChatDatabase.updateUser(users[index])
            }
        }
        delete existGroupChat.idUsers
        existGroupChat.users = usersResult
        return existGroupChat
    },
    getGroupsOfUser: async (idUser, page) => {
        const perPage = 10
        const user = await UserChatDatabase.getUser(idUser)
        if (user == null) {
            return null
        }
        const data = await GroupChat.find({'idUsers.idUser': {'$in': [idUser]}}).sort({'lastMessage.time': -1}).limit(perPage).skip(page * perPage)
        const count = await GroupChat.find({'idUsers.idUser': {'$in': [idUser]}}).countDocuments()
        const dataRes = []
        for (const i in data) {
            const item = JSON.parse(JSON.stringify(data[i]))
            const usersRes = []
            for (const j in item.idUsers) {
                const user = await UserChatDatabase.getUser(item.idUsers[j].idUser)
                usersRes.push({
                    idUser: user.idUser,
                    name: user.name,
                    avatar: user.avatar,
                    haveUnreadMessage: item.idUsers[j].haveUnreadMessage
                })
            }
            delete item.idUsers
            item.users = usersRes
            dataRes.push(item)
        }
        return {currentPage: Number(page), pages: Math.ceil(count / perPage), data: dataRes}
    },
    getGroupChatById: async (id) => {
        try {
            const result = await GroupChat.findOne({_id: id})
            return result
        } catch (e) {
            return null
        }

    },
    updateGroupChat: async (data) => {
        try {
            const result = await GroupChat.findOneAndUpdate({_id: data._id}, data)
            return result
        } catch (e) {
            return null
        }
    },
    getSpecificGroupChat: async (idUsers) => {
        try {
            const result = await GroupChat.findOne({'idUsers.idUser': {'$all': idUsers}}).lean()
            const usersRes = []
            for (const j in result.idUsers) {
                const user = await UserChatDatabase.getUser(result.idUsers[j].idUser)
                usersRes.push({
                    idUser: user.idUser,
                    name: user.name,
                    avatar: user.avatar,
                    haveUnreadMessage: result.idUsers[j].haveUnreadMessage
                })
            }
            delete result.idUsers
            result.users = usersRes
            return result
        } catch (e) {
            return null
        }
    }
}

module.exports = GroupChatDatabase