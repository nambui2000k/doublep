const PetTinderDatabase = require('../database/PetTinderDatabase')
const InviteDatabase = require('../database/InviteDatabase')

const throwError = (message, res) => {
    res.status(400).send({message: message})
}
const PetTinderAPI = {
    creat: (app, upload,socketMap,fcm) => {
        app.post('/mobile/api/invite', upload.none(), async (req, res) => {
            const from = req.header('Authorization')
            const to = req.body.to
            const data = await InviteDatabase.addInvite(from, to,socketMap,fcm)
            if (data == null) {
                throwError("Cant Sent", res)
            } else {
                res.status(200).send(data)
            }
        })

        app.delete("/mobile/api/invite", upload.none(), async (req, res) => {
            const from = req.header('Authorization')
            const to = req.body.to
            const data = await InviteDatabase.deleteInvite(from, to)
            if (data == null) {
                throwError("Cant Sent", res)
            } else {
                res.status(200).send(data)
            }
        })

        app.get("/mobile/api/receive_invite", async (req, res) => {
            const idUser = req.header('Authorization')
            const page = req.query.page
            if (idUser == null) {
                throwError("UnAuthorization", res)
            } else {
                const data = await InviteDatabase.getInviteReceives(idUser, page)
                if (data == null) {
                    throwError("UnAuthorization", res)
                } else
                    res.status(200).send(data)
            }
        })

        app.get("/mobile/api/sent_invite", async (req, res) => {
            const idUser = req.header('Authorization')
            const page = req.query.page
            if (idUser == null) {
                throwError("UnAuthorization", res)
            } else {
                const data = await InviteDatabase.getInviteSent(idUser, page)
                res.status(200).send(data)
            }
        })
    }
}

module.exports = PetTinderAPI