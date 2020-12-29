const Account = require("../model/account")

const UserDatabase = {
    getUserById: async (id) => {
        if (id == null) return null
        try {
            const res =  await Account.findOne({_id:id}).lean()
            return res
        } catch (e) {
            return null
        }

    },
    getUserByFilter:async (filter)=>{
        try {
            return await Account.find(filter).lean()
        }catch (e){
            return null
        }
    }
}

module.exports = UserDatabase