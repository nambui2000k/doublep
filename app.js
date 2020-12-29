let express = require('express')
let app = express()
let http = require('http').createServer(app)
let bodyparser = require('body-parser')
let hbs = require('express-handlebars');
let cors = require('cors');
let yaml = require('yamljs')
let dotenv = require('dotenv')
const multer = require('multer')
const fs = require('fs')
const storage = multer.diskStorage({
    destination: (request, file, cb) => {
        cb(null, './uploads/message');
    },
    filename: (req, file, callback) => {
        const hrtime = process.hrtime();
        callback(null, "message" + ((hrtime[0] * 1e6) + (hrtime[1]) * 1e-3).toString() + file.originalname);
    }
})
const upload = multer({
    storage: storage, fileFilter: function (req, file, callback) {
        if (file.originalname == undefined) {
            callback(new Error("Not Found"), false);
        } else {
            callback(null, true);
        }
    }
})
if (!fs.existsSync('./uploads/message')) {
    fs.mkdirSync('./uploads/message')
}

const HashMap = require('hashmap')
const SocketConstant = require('./ultil/SocketConstant')
const FCM = require('fcm-node')


const fcm = new FCM(SocketConstant.FCM_SERVER_KEY)

const io = require('socket.io')(http)

const socketMap = new HashMap()

//api
const userApi = require('./api/UserChatAPI')
const groupChatAPI = require('./api/GroupChatAPI')
const chatAPI = require('./api/ChatAPI')
const petTinderAPI = require('./api/PetTinderAPI')
const inviteAPI = require('./api/InviteAPI')
//socket
const groupChatSocket = require('./socket/GroupChatSocket')
const chatSocket = require('./socket/ChatSocket')
const mapSocketModule = require('./socket/MapSocket')
const mapSocketMap = {}

dotenv.config()
const port = process.env.PORT_LOCAL || 3000
app.use(express.static('public'))
app.use(cors())
app.use(express.static('uploads'))
http.listen(port)
let mongoose = require('mongoose');
let mongooseChat = require('mongoose');
let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');
let petRouter = require('./routes/pets');
let notificationRouter = require('./routes/notification')
let newsRouter = require('./routes/newsRouter');
let index = require('./routes/frontend/index');
let loginRouter = require('./routes/frontend/login');
let ban = require('./routes/frontend/ban');
let banComment = require('./routes/frontend/banComment');
let userRouter = require('./routes/frontend/user');
let typePetRouter = require('./routes/frontend/type-pet');
let statisticalNews = require('./routes/frontend/statisticalNew');
let statisticalComment = require('./routes/frontend/statisticalComment');
let breedRouter = require('./routes/frontend/breed')

app.use(bodyparser.json());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(bodyparser.urlencoded({extended: true}));
app.engine('.hbs', hbs({
    extname: 'hbs',
    defaultLayout: '',
    layoutsDir: '',
}));
app.set('view engine', '.hbs');


const dbHost = process.env.DB_HOST || 'localhost'
const dbPort = process.env.DB_PORT || 27017
const dbName = process.env.DB_NAME || 'my_db_name'
const dbUser = process.env.DB_USER
const dbUserPassword = process.env.DB_PASSWORD


io.on('connect', (socket) => {
    let idUser = ""
    console.log(socket)
    socket.on(SocketConstant.LOGIN, data => {
        console.log("on")
        const body = JSON.parse(data)
        idUser = body.idUser
        console.log(idUser)
        let entry = socketMap.get(idUser)
        if (entry) {
            entry.push(socket)
        } else {
            entry = [socket]
        }
        socketMap.set(idUser, entry)
        groupChatSocket.listener(io, socket, socketMap, fcm)
        chatSocket.listener(io, socket, socketMap, fcm)
        mapSocketModule.listen(socket,mapSocketMap,socketMap)
    })
    socket.on("disconnect", () => {
        console.log("disconnect")
        mapSocketModule.leftMap(idUser,mapSocketMap,socketMap)
        let entry = socketMap.get(idUser)
        if (entry != null && entry.length > 1) {
            entry = entry.filter(value => value !== socket)
            socketMap.set(idUser, entry)
        } else {
            socketMap.remove(idUser)
        }
    })
})

userApi.create(app, upload)

groupChatAPI.create(app, upload)
chatAPI.create(app, upload, socketMap, fcm)
petTinderAPI.create(app, upload)
inviteAPI.creat(app, upload, socketMap, fcm)

const mongoUrl = `mongodb+srv://admin:admin@cluster0.xpyw5.mongodb.net/doublep?retryWrites=true&w=majority`
//Nếu push code lên thì mở comment dòng const mongoUrl = `mongodb+srv://admin:admin@cluster0.xpyw5.mongodb.net/doublep?retryWrites=true&w=majority`
//Nếu làm thì dùng dòng const mongoUrl = `mongodb+srv://doublepadmin:doublepadmin@cluster0.m0gdh.gcp.mongodb.net/doublep?authSource=admin&replicaSet=atlas-10vcvl-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true`
//const mongoUrl = `mongodb+srv://doublepadmin:doublepadmin@cluster0.m0gdh.gcp.mongodb.net/doublep?authSource=admin&replicaSet=atlas-10vcvl-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true`

console.log(mongoUrl)

mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(function () {
    console.log('connected');
})

// mongooseChat.connect(
//     'mongodb+srv://admin:admin@cluster0.zjzkl.mongodb.net/doublePChat?retryWrites=true&w=majority',
//     {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false},
//     () => {
//         console.log('Database has been connected successfully!')
//     }
// )

console.log("Run in port: " + port)
console.log("Docker OK!!!")

//Route Backend
app.use('/api/index', indexRouter);
app.use('/users', usersRouter);
app.use('/pets', petRouter);
app.use('/news', newsRouter);
app.use('/notification', notificationRouter);
app.post("/test", (req, res) => {
    console.log(req.body.name)
    res.end(req.body.name)
})
/// Route Fontend
app.use('/', index);
app.use('/login', loginRouter);
app.use('/user',(req,res,next)=>{
    req.socketMap = socketMap
    next()
}, userRouter);
app.use('/typePet', typePetRouter);
app.use('/ban', ban);
app.use('/banComment', banComment);
app.use('/statisticalNew', statisticalNews);
app.use('/statisticalComment', statisticalComment);
app.use('/breed', breedRouter);




