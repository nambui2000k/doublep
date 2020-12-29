const SocketConstant = require('../ultil/SocketConstant')
const MAPSocket = {
    listen: (socket, mapSocketMap, mapSocket) => {
        let idUser = null
        socket.on(SocketConstant.JOIN_MAP, data => {
            let body = {}
            try {
                body = JSON.parse(data)
            } catch (e) {
                return
            }
            if (body == null) return
            const latitude = body.latitude
            const longitude = body.longitude
            const username = body.username
            const avatar = body.avatar
            idUser = body.idUser
            if (idUser == null || latitude == null || longitude == null || username == null || avatar == null) return
            const position = {idUser:idUser,latitude: latitude, longitude: longitude, username: username, avatar: avatar}
            mapSocketMap[`${idUser}`] = position
            const keys = mapSocket.keys()
            keys.forEach(key => {
                if (key !== idUser) {
                    const sockets = mapSocket.get(key)
                    for (const j in sockets) {
                        sockets[j].emit(SocketConstant.JOIN_MAP, JSON.stringify(position))
                    }
                }
            })
            socket.emit(SocketConstant.MAP_DATA, JSON.stringify(mapSocketMap))
        })
        socket.on(SocketConstant.LEFT_MAP, idUser => {
            MAPSocket.leftMap(idUser, mapSocketMap, mapSocket)
        })
        socket.on(SocketConstant.MOVE_MAP, data => {
            let body = {}
            try {
                body = JSON.parse(data)
            } catch (e) {
                return
            }
            if (body == null) return
            const latitude = body.latitude
            const longitude = body.longitude
            const username = body.username
            const avatar = body.avatar
            idUser = body.idUser
            if (idUser == null || latitude == null || longitude == null || username == null || avatar == null) return
            const position = {idUser:idUser,latitude: latitude, longitude: longitude, username: username, avatar: avatar}
            mapSocketMap[`${idUser}`] = position
            const keys = mapSocket.keys()
            keys.forEach(key => {
                if (key !== idUser) {
                    const sockets = mapSocket.get(key)
                    for (const j in sockets) {
                        sockets[j].emit(SocketConstant.MOVE_MAP, JSON.stringify(position))
                    }
                }
            })
        })
    },
    leftMap: (idUser, mapSocketMap, mapSocket) => {
        if (idUser != null) {
            const id = mapSocketMap[`${idUser}`]
            if (id == null) return
            delete mapSocketMap[`${idUser}`]
            const keys = mapSocket.keys()
            keys.forEach(key => {
                if (key !== idUser) {
                    const sockets = mapSocket.get(key)
                    for (const j in sockets) {
                        sockets[j].emit(SocketConstant.LEFT_MAP, JSON.stringify(idUser))
                    }
                }
            })
        }
    }
}

module.exports = MAPSocket