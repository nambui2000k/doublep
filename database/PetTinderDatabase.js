const Pet = require('../model/pet');
const UserDatabase = require('../database/UserDatabase');
const SocketConstant = require('../ultil/SocketConstant')
const BreedDatabase = require("./BreedDatabase");
const GroupChatDatabase = require("./GroupChatDatabase");
const InviteDatabase = require("./InviteDatabase");

const PetTinder = {
    getAllPet: async (idUser, page) => {
        if (page == null) page = 0
        const perPage = 10
        const user = await UserDatabase.getUserById(idUser)
        if (user == null) return null
        const petFind = await Pet.findOne({_id: user.currentPet})
        if (petFind == null) return null
        const time = new Date().getTime()
        const result = await Pet.find({
            idOwner: {'$ne': idUser},
            idType: petFind.idType,
            sex: {'$ne': petFind.sex}
        }).sort({'$natural': -1}).skip(perPage * page).limit(perPage).lean()

        const count = await Pet.find({
            idOwner: {'$ne': idUser},
            idType: petFind.idType,
            sex: {'$ne': petFind.sex}
        }).countDocuments()

        for (const i in result) {
            result[i].avatar = SocketConstant.BASE_URL + result[i].avatar
            const offset = time - result[i].birthday
            const days = offset / 86400000
            result[i].birthday = Math.round(days / 30)
        }
        return {total_page: Math.ceil(count / perPage), current_page: page, data: result}
    },
    getPetFilter: async (idUser, filter, page) => {
        if (filter == null) return null
        if (page == null) page = 0

        const account = await UserDatabase.getUserById(idUser)
        if (account == null) return null
        const petFind = await Pet.findOne({_id: account.currentPet})
        if (petFind == null) return null
        const time = new Date().getTime()


        const idBreed = filter.idBreed
        const age = filter.age
        const height = filter.height
        const weight = filter.weight
        const province = filter.province
        const district = filter.district
        const commune = filter.commune

        const userFilter = {}
        if (province != null) userFilter.province = province
        if (district != null && province != null) userFilter.district = district
        if (commune != null && province != null && district != null) userFilter.commune = commune
        let user = null
        const petFilter = {}
        try {
            if (userFilter !== {}) {
                user = await UserDatabase.getUserByFilter(userFilter)
                if (user != null && user.length > 0) {
                    petFilter.idOwner = {'$in': user.map(value => value._id), '$ne': idUser}
                } else {
                    petFilter.idOwner = {'$ne': idUser}
                }
            }
            if (idBreed != null) {
                petFilter.idBreed = idBreed
            }
            if (age != null) {
                const time = new Date().getTime()
                const to = time - parseInt(age.split("-")[0]) * 86400000 * 30
                const from = time - parseInt(age.split("-")[1]) * 86400000 * 30
                petFilter.birthday = {'$lte': to, '$gte': from}
            }
            if (height != null) {
                const from = parseInt(height.split("-")[0])
                const to = parseInt(height.split("-")[1])
                petFilter.height = {'$lte': to, '$gte': from}
            }

            if (weight != null) {
                const from = parseInt(weight.split("-")[0])
                const to = parseInt(weight.split("-")[1])
                petFilter.weight = {'$lte': to, '$gte': from}
            }


            petFilter.send = {'$ne': petFind.sex}

            const perPage = 10
            const count = await Pet.find(petFilter).countDocuments()
            const result = await Pet.find(petFilter).sort({'$natural': -1}).skip(page * perPage).limit(perPage).lean()
            const newData = []
            for (const i in result) {
                const item = result[i]
                item.avatar = SocketConstant.BASE_URL + item.avatar
                const offset = time - item.birthday
                const days = offset / 86400000
                item.birthday = Math.round(days / 30)

                const breed = await BreedDatabase.getBreedById(item.idBreed)
                delete item.idBreed
                delete item.__v
                const owner = await UserDatabase.getUserById(item.idOwner)
                let friendStatus = 0
                if (owner != null) {
                    const commune = owner.commune != null && owner.commune.length > 0 && owner.commune !== "null" ? `${owner.commune} - ` : ''
                    const district = owner.district != null && owner.district.length > 0 && owner.district !== "null" ? `${owner.district} - ` : ''
                    const province = owner.province != null && owner.province.length > 0 && owner.province !== "null" ? `${owner.province}` : ''
                    if (commune.length !== 0 && district.length !== 0 && province.length !== 0)
                        item.address = `${commune}${district}${province}`
                    const groupChat = await GroupChatDatabase.getSpecificGroupChat([idUser, owner._id.toString()])
                    if (groupChat != null) {
                        friendStatus = 3
                        item.group_chat = groupChat
                    } else {
                        let exist = await InviteDatabase.getSpecificInvite(idUser, owner._id)
                        if (exist != null) {
                            friendStatus = 1
                        } else {
                            exist = await InviteDatabase.getSpecificInvite(owner._id, idUser)
                            if (exist != null) {
                                friendStatus = 2
                            }
                        }
                    }
                }
                item.friend_status = friendStatus
                item.breed = breed

                newData.push(item)
            }
            return {total_page: Math.ceil(count / perPage), current_page: page, data: newData}
        } catch (e) {
            return null
        }

    },
    getPetTinderOfSpecificUser: async (idUser, idOwner) => {
        const user = await UserDatabase.getUserById(idUser)
        if (user == null) return null
        const time = new Date().getTime()
        const result = await Pet.find({idOwner: idOwner}).sort({'$natural': -1}).lean()
        const newData = []
        for (const i in result) {
            const item = result[i]
            item.avatar = SocketConstant.BASE_URL + item.avatar
            const offset = time - item.birthday
            const days = offset / 86400000
            item.birthday = Math.round(days / 30)

            const breed = await BreedDatabase.getBreedById(item.idBreed)
            delete item.idBreed
            delete item.__v
            const owner = await UserDatabase.getUserById(item.idOwner)
            let friendStatus = 0
            if (owner != null) {
                const commune = owner.commune != null && owner.commune.length > 0 && owner.commune !== "null" ? `${owner.commune} - ` : ''
                const district = owner.district != null && owner.district.length > 0 && owner.district !== "null" ? `${owner.district} - ` : ''
                const province = owner.province != null && owner.province.length > 0 && owner.province !== "null" ? `${owner.province}` : ''
                if (commune.length !== 0 && district.length !== 0 && province.length !== 0)
                    item.address = `${commune}${district}${province}`
                const groupChat = await GroupChatDatabase.getSpecificGroupChat([idUser, owner._id.toString()])
                if (groupChat != null) {
                    friendStatus = 3
                    item.group_chat = groupChat
                } else {
                    let exist = await InviteDatabase.getSpecificInvite(idUser, owner._id)
                    if (exist != null) {
                        friendStatus = 1
                    } else {
                        exist = await InviteDatabase.getSpecificInvite(owner._id, idUser)
                        if (exist != null) {
                            friendStatus = 2
                        }
                    }
                }
            }
            item.friend_status = friendStatus
            item.breed = breed

            newData.push(item)
        }
        return {total_page: newData.length, current_page: 0, data: newData}
    }
}

module.exports = PetTinder