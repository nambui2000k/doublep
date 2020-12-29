const Invite = require("../model/Invite")
const UserDatabase = require('../database/UserDatabase')
const GroupChatDatabase = require('../database/GroupChatDatabase')
const GroupChatSocket = require('../socket/GroupChatSocket')
const SocketConstant = require('../ultil/SocketConstant')

const InviteDatabase = {
    addInvite: async (from, to, socketMap, fcm) => {
        const userFrom = await UserDatabase.getUserById(from)
        const userTo = await UserDatabase.getUserById(to)
        if (userFrom == null || userTo == null) return null
        let exist = await InviteDatabase.getSpecificInvite(from, to)
        if (exist != null) return null
        exist = await InviteDatabase.getSpecificInvite(to, from)
        if (exist != null) {
            await InviteDatabase.deleteInvite(to, from)
            await GroupChatSocket.addGroup(from,[from,to],socketMap,fcm)
            return null
        }
        exist = await GroupChatDatabase.getSpecificGroupChat([from, to])
        if (exist != null) return null
        const invite = new Invite({from: from, to: to, sentTime: new Date().getTime()})
        const res = await invite.save()
        const sockets = socketMap.get(to)
        if (sockets != null) {
            for (const i in sockets) {
                sockets[i].emit(SocketConstant.RECEIVE_INVITE, JSON.stringify(await InviteDatabase.getInviteReceives(to, 0)))
            }
        } else {
            fcm.send({
                to: `/topics/${to}`,
                notification: {
                    title: `Lời mời ghép đôi`,
                    body: `${userFrom.fullName} muốn Kết nối chọn giống với bạn`
                },
                android:{
                    priority:"high"
                },
                priority: 10
            },(err,res)=>{})
        }
        return res
    },
    getInviteReceives: async (idUser, page) => {
        if (page == null) {
            page = 0
        }
        const user = await UserDatabase.getUserById(idUser)
        if (user == null)
            return null
        const perPage = 20
        const res = await Invite.find({to: idUser}).limit(perPage).skip(page * perPage).lean()
        const data = []
        for (const i in res) {
            const item = res[i]
            const user = {}
            const owner = await UserDatabase.getUserById(item.from)
            user._id = owner._id
            user.fullName = owner.fullName
            user.avatar = `${SocketConstant.BASE_URL}${owner.avatar}`
            delete item.from
            delete item.to
            item.target = user
            data.push(item)
        }
        const count = await Invite.find({to: idUser}).countDocuments()
        return {current_page: page, total_page: Math.ceil(count / perPage), data: data}
    },
    getInviteSent: async (idUser, page) => {
        if (page == null) {
            page = 0
        }
        const perPage = 20
        const res = await Invite.find({from: idUser}).limit(perPage).skip(page * perPage)
        const data = []
        for (const i in res) {
            let item = res[i]._doc
            const user = {}
            const owner = await UserDatabase.getUserById(item.to)
            user._id = owner._id
            user.fullName = owner.fullName
            user.avatar = `${SocketConstant.BASE_URL}${owner.avatar}`
            delete item.to
            delete item.from
            item.target = user
            data.push(item)
        }
        const count = await Invite.find({from: idUser}).countDocuments()
        return {current_page: page, total_page: Math.ceil(count / perPage), data: data}
    },
    getSpecificInvite: async (from, to) => {
        try {
            return await Invite.findOne({from: from, to: to})
        } catch (e) {
            return null
        }
    },
    deleteInvite: async (from, to) => {
        try {
            return await Invite.deleteOne({from: from, to: to})
        } catch (e) {
            return null
        }
    }
}

module.exports = InviteDatabase