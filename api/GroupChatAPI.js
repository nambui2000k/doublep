const GroupChatDatabase = require('../database/GroupChatDatabase')

const GroupChatAPI = {
    create: (app, upload,fcm) => {
        app.post("/api/chat/add_group", upload.none(), async (req, res) => {
            const body = req.body
            if (body == null) {
                res.status(400).send({message: "Empty body"})
                return
            }
            if (body.idUsers == null || undefined || "" || body.idUser ==null) {
                res.status(400).send({message: "Empty body"})
                return
            }
            try {
                let idUsers = JSON.parse(body.idUsers)
                if (Array.isArray(idUsers)) {
                    idUsers.push(body.idUser)
                    idUsers = [...new Set(idUsers)]
                    const group = await GroupChatDatabase.addGroup(idUsers)
                    if (group != null) {
                        res.status(200).send(await GroupChatDatabase.getGroupsOfUser(body.idUser, 0))
                    } else {
                        res.status(400).send({message: "User not exist"})
                    }

                }
            } catch (e) {
                res.status(400).send({message: `${e}`})
            }

        })

        app.post('/api/chat/my_group_chat', upload.none(), async (req, res) => {
            const body = req.body
            if (body == null) {
                res.status(400).send({message: "empty body was not allowed"})
                return
            }
            const page = body.page
            const idUser = body.idUser
            const result = await GroupChatDatabase.getGroupsOfUser(idUser, page)
            if (result != null)
                res.status(200).send(result)
            else
                res.status(401).send({message: "User not exist!"})
        })
    }
}

module.exports = GroupChatAPI