const UserChatDatabase = require('../database/UserChatDatabase')

const UserAPI = {
    create: (app, upload) => {
        app.post('/api/chat/login', upload.none(), async (req, res) => {
            if (req.body == null) {
                res.status(400).send({message: "missing field"})
                return
            }
            const idUser = req.body.idUser
            const idDevice = req.body.idDevice
            const name = req.body.name
            const avatar = req.body.avatar
            if (idUser == null || idDevice == null || name ==null || avatar ==null) {
                res.status(400).send({message: "missing field"})
                return
            }
            const user = await UserChatDatabase.getUser(idUser)
            if (user != null) {
                if (!user.idDevice.includes(idDevice)) {
                    user.idDevice.push(idDevice)
                }
                user.name = name
                user.avatar = avatar
                await UserChatDatabase.updateUser(user)
                res.status(200).send(user)
            } else {
                await UserChatDatabase.addUser(req.body)
                res.status(200).send(await UserChatDatabase.getUser(req.body.idUser))
            }
        })

        app.post("/api/chat/logout", upload.none(), async (req, res) => {
            if (req.body == null) {
                res.status(400).send({message: "missing field"})
                return
            }
            const idUser = req.body.idUser
            const idDevice = req.body.idDevice
            if (idUser == null || idDevice == null) {
                res.status(400).send({message: "missing field"})
                return
            }
            const user = await UserChatDatabase.getUser(req.body.idUser)
            if (user != null) {
                user.idDevice = user.idDevice.filter(value => value !== idDevice)
                await UserChatDatabase.updateUser(user)
                res.status(200).send(user)
            } else {
                res.status(401).send({message:"this user was not exist!"})
            }
        })
    }
}

module.exports = UserAPI