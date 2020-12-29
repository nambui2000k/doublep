let express = require('express');
let router = express.Router();
const bodyparser = require('body-parser');
let multer = require('multer');
let admin = require('firebase-admin');
const fs = require('fs');
const verify = require('./verifyToken');
const Account = require('../model/account');
const Notification = require('../model/notification');
const socketConstant = require('../ultil/SocketConstant')
const BASE_URL = socketConstant.BASE_URL

let storage = multer.diskStorage({
    destination: function (request, file, cb) {
        cb(null, './uploads/news');
    },
    filename: function (req, file, callback) {
        const hrtime = process.hrtime();
        callback(null, "news" + ((hrtime[0] * 1e6) + (hrtime[1]) * 1e-3).toString() + file.originalname);
    }
})
let upload = multer({
    storage: storage, limits: {}, fileFilter: function (req, file, callback) {
        if (file.originalname == undefined) {
            callback(new Error("Not Found"), false);
        } else {
            callback(null, true);
        }
    }
}).array('images', 5);
router.use(bodyparser.urlencoded({extended: true}));
router.use(bodyparser.json());
const News = require('../model/news');
const Comment = require('../model/comment');
// router.post('/mobile/api/getMyNewsList',verify ,async (req, res) => {
//     let account = req.account;
//     let limit = req.body.limit==undefined?5:Number(req.body.limit);
//     let page = req.body.page==undefined?0:Number(req.body.page);
//     News.find({idOwner: account._id,isLocked: false},{},{skip: page*limit, limit: limit}).then(async data=>{
//         let listNews = [];
//
//         if (data.length!=null&&data.length!=undefined&&data.length!=0){
//             for (let i = 0; i < data.length; i++){
//
//                 let isLike = false;
//                 if (data[i].favoritePersons.length!=null&&data[i].favoritePersons.length!=undefined&&data[i].favoritePersons.length!=0&&data[i].favoritePersons.includes(req.account._id)){
//                     isLike = true;
//                 }
//                 let account= await Account.findById(data[i].idOwner);
//
//                 var current = new Date().getTime();
//
//                 var timeRemain = Number(current-data[i].timeCreated);
//                 let images = [];
//                 for (var j=0;j<data[i].images.length;j++){
//                     images.push(BASE_URL+data[i].images[j]);
//                 }
//                 listNews.push({
//                     _id: data[i]._id,
//                     isLike: isLike,
//                     images: images,
//                     favoritePersons: data[i].favoritePersons,
//                     idComments: data[i].idComments,
//                     idReporters: data[i].idReporters,
//                     idOwner: data[i].idOwner,
//                     timeCreated: data[i].timeCreated,
//                     content: data[i].content,
//                     isLocked: data[i].isLocked,
//                     timeRemain: timeRemain,
//                     account: {
//                         _id: account._id,
//                         avatar: BASE_URL+account.avatar,
//                         fullName: account.fullName,
//                     },
//                 });
//             }
//         }
//         res.status(200).send({message: "success",data:{listNews:listNews}});
//
//     }).catch(e=>{
//         res.status(400).send({message: e.message,data:{}});
//     })
// })


router.post('/mobile/api/getMyListImageNews', verify, async (req, res) => {
    let account = req.account;
    let limit = req.body.limit == undefined ? 15 : Number(req.body.limit);
    let page = req.body.page == undefined ? 0 : Number(req.body.page);
    News.find({idOwner: account._id, isLocked: false}, {}, {skip: page * limit, limit: limit}).then(async data => {
        let listNews = [];

        if (data.length != null && data.length != undefined && data.length != 0) {
            for (let i = 0; i < data.length; i++) {

                listNews.push({
                    _id: data[i]._id,
                    images: BASE_URL + data[i].images[0],
                });
            }
        }
        res.status(200).send({message: "success", data: {listNews: listNews}});

    }).catch(e => {
        res.status(400).send({message: e.message, data: {}});
    })
})


router.post('/mobile/api/getNewsList', verify, async (req, res) => {
    let limit = req.body.limit == undefined ? 5 : Number(req.body.limit);
    let page = req.body.page == undefined ? 0 : Number(req.body.page);
    News.find({isLocked: false}, {}, {skip: page * limit, limit: limit}).sort({$natural: -1}).then(async data => {
        console.log(data.length);
        let listNews = [];
        if (data.length != null && data.length != undefined && data.length != 0) {
            for (let i = 0; i < data.length; i++) {
                let isLike = false;
                if (data[i].favoritePersons.length != null && data[i].favoritePersons.length != undefined && data[i].favoritePersons.length != 0 && data[i].favoritePersons.includes(req.account._id)) {
                    isLike = true;
                }
                let account = await Account.findById(data[i].idOwner);
                if (account ==null) continue
                var current = new Date().getTime();
                var timeRemain = Number(current - data[i].timeCreated);
                let images = [];
                for (var j = 0; j < data[i].images.length; j++) {
                    images.push(BASE_URL + data[i].images[j]);
                }
                listNews.push({
                    _id: data[i]._id,
                    isLike: isLike,
                    images: images,
                    favoritePersons: data[i].favoritePersons,
                    idComments: data[i].idComments,
                    idReporters: data[i].idReporters,
                    idOwner: data[i].idOwner,
                    timeCreated: data[i].timeCreated,
                    content: data[i].content,
                    isLocked: data[i].isLocked,
                    timeRemain: timeRemain,
                    account: {
                        _id: account._id,
                        avatar: BASE_URL + account.avatar,
                        fullName: account.fullName,
                    }
                });
            }
        }
        res.status(200).send({message: "success", data: {listNews: shuffle(listNews)}});
    }).catch(e => {
        res.status(400).send({message: e.message, data: {}});
    })
})

router.post('/mobile/api/getNewsListV2', verify, async (req, res) => {
    let limit = req.body.limit == undefined ? 5 : Number(req.body.limit);
    let page = req.body.page == undefined ? 0 : Number(req.body.page);
    News.find({isLocked: false}, {}, {skip: page * limit, limit: limit}).sort({$natural: -1}).then(async data => {
        console.log(data.length);
        let listNews = [];
        if (data.length != null && data.length != undefined && data.length != 0) {
            for (let i = 0; i < data.length; i++) {
                let isLike = false;
                if (data[i].favoritePersons.length != null && data[i].favoritePersons.length != undefined && data[i].favoritePersons.length != 0 && data[i].favoritePersons.includes(req.account._id)) {
                    isLike = true;
                }
                let account = await Account.findById(data[i].idOwner);
                var current = new Date().getTime();
                var timeRemain = Number(current - data[i].timeCreated);
                let images = [];
                for (var j = 0; j < data[i].images.length; j++) {
                    images.push(BASE_URL + data[i].images[j]);
                }
                listNews.push({
                    _id: data[i]._id,
                    isLike: isLike,
                    images: images,
                    favoritePersons: data[i].favoritePersons.length,
                    idComments: data[i].idComments.length,
                    extensionNews: data[i].idOwner != account._id ? 0: 1,
                    content: data[i].content,
                    timeRemain: timeRemain,
                    avatar: BASE_URL + account.avatar,
                    fullName: account.fullName,
                });
            }
        }
        res.status(200).send({message: "success", data: {listNews: shuffle(listNews)}});
    }).catch(e => {
        res.status(400).send({message: e.message, data: {}});
    })
})

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

router.post('/mobile/api/createNews', verify, async (req, res) => {
    if (!fs.existsSync('./uploads/news')) {
        fs.mkdirSync('./uploads/news');
    }
    upload(req, res, async function (err) {
        if (err) {
            res.status(401).send({message: err.message, data: {}});
        }
        let news = new News({
            idOwner: req.account._id,
            timeCreated: new Date().getTime(),
            content: req.body.content,
            images: [],
            isLocked: false,
        })
        if (req.files == undefined) {
            res.status(401).send({message: err.message, data: {}});
        } else {
            for (let i = 0; i < req.files.length; i++) {
                let image = req.files[i].path;
                news.images.push(image.substring(8, image.length));
            }
        }

        news.save(async (err,result)=>{
            if (err){
                res.status(400).send({message: err.message,data:{}});
            }else {

                let account = await Account.findByIdAndUpdate(req.account._id,{$push: {idNews: result._id}});
                var current = new Date().getTime();
                var timeRemain = Number(current - result.timeCreated);
                let images = [];
                for (var j = 0; j < result.images.length; j++) {
                    images.push(BASE_URL + result.images[j]);
                }
                res.status(200).send({
                    message: "success", data: {
                        news: {
                            _id: result._id,
                            isLike: false,
                            images: images,
                            favoritePersons: result.favoritePersons,
                            idComments: result.idComments,
                            idReporters: result.idReporters,
                            idOwner: result.idOwner,
                            timeCreated: result.timeCreated,
                            content: result.content,
                            isLocked: result.isLocked,
                            timeRemain: timeRemain,
                            account: {
                                _id: account._id,
                                avatar: BASE_URL + account.avatar,
                                fullName: account.fullName,
                            }
                        }
                    }
                });
            }
        })
    })
})
router.post('/mobile/api/createComment', verify, async (req, res) => {
    let comment = new Comment({
        idOwner: req.account._id,
        idNews: req.body.idNews,
        timeCreated: new Date().getTime(),
        content: req.body.content,
        isLocked: false,
    })
    comment.save(async (err, result) => {
        if (err) {
            res.status(400).send({message: err.message, data: {}});

        } else {
            let news = await News.findByIdAndUpdate(req.body.idNews, {$push: {idComments: result._id.toString()}});

            let account = await Account.findById(req.account._id);
            let ownerAccount = await Account.findById(news.idOwner);
            var current = new Date().getTime();
            var timeRemain = Number(current - result.timeCreated);

            if (req.account._id != news.idOwner) {
                let listUserComment = [];
                for (var i = 0; i < news.idComments.length; i++) {
                    let comment = await Comment.findById(news.idComments[i]);
                    if (listUserComment.includes(comment.idOwner) == false && comment.idOwner != news.idOwner) {
                        listUserComment.push(comment.idOwner);
                    }
                }

                Notification.findOne({typeNotification: 3, idDetail: news._id}, async (err, data) => {
                    console.log(news._id);
                    console.log(data);
                    if (data == null || data == undefined) {
                        let notification = new Notification({
                            idOwner: news.idOwner,
                            typeNotification: 3,
                            timeCreated: current,
                            isRead: false,
                            idDetail: news._id,
                            nameUserLastModify: account.fullName,
                            avatar: account.avatar,
                            content: listUserComment.length - 1,
                        })
                        notification.save();
                        const message = {
                            data: {
                                idOwner: news.idOwner,
                                typeNotification: 3,
                                timeCreated: notification.timeCreated,
                                isRead: false,
                                idDetail: notification.idDetail,
                                nameUserLastModify: notification.nameUserLastModify,
                                avatar: notification.avatar,
                                content: notification.content,
                                timeRemain: timeRemain,
                            },
                            tokens: ownerAccount.idToken,
                        }
                    } else {
                        console.log('hello');
                        let notification = await Notification.findByIdAndUpdate(data._id, {
                            timeCreated: current,
                            isRead: false,
                            nameUserLastModify: account.fullName,
                            avatar: account.avatar,
                            content: listUserComment.length - 1,
                        })
                        const message = {
                            data: {
                                typeNotification: 3,
                                timeCreated: notification.timeCreated,
                                isRead: false,
                                idDetail: notification.idDetail,
                                nameUserLastModify: notification.nameUserLastModify,
                                avatar: notification.avatar,
                                content: notification.content,
                                timeRemain: timeRemain,
                            },
                            tokens: ownerAccount.idToken,
                        }
                    }
                })
            }


            res.status(200).send({
                message: "success", data: {
                    comment: {
                        _id: result._id,
                        content: result.content,
                        idOwner: result.idOwner,
                        idReporters: result.idReporters,
                        idNews: result.idNews,
                        isLocked: result.isLocked,
                        timeCreated: result.timeCreated,
                        timeRemain: timeRemain,
                        account: {
                            _id: account._id,
                            avatar: BASE_URL + account.avatar,
                            fullName: account.fullName,
                        },
                    }
                }
            });

        }
    })
})
router.post('/mobile/api/getComment', verify, async (req, res) => {
    let limit = req.body.limit == undefined ? 5 : Number(req.body.limit);
    let page = req.body.page == undefined ? 1 : Number(req.body.page);
    Comment.find({isLocked: false, idNews: req.body.idNews}, {}, {
        skip: page * limit,
        limit: limit
    }).sort({$natural: -1}).then(async data => {
        let listComment = [];
        for (let i = 0; i < data.length; i++) {
            let account = await Account.findById(data[i].idOwner);
            var current = new Date().getTime();
            var timeRemain = Number(current - data[i].timeCreated);
            listComment.push({
                _id: data[i]._id,
                content: data[i].content,
                idOwner: data[i].idOwner,
                idReporters: data[i].idReporters,
                idNews: data[i].idNews,
                isLocked: data[i].isLocked,
                timeCreated: data[i].timeCreated,
                timeRemain: timeRemain,
                account: {
                    _id: account._id,
                    avatar: BASE_URL + account.avatar,
                    fullName: account.fullName,
                },
            })
        }
        res.status(200).send({message: "success", data: {listComment: listComment}});
    }).catch(e => {
        res.status(400).send({message: e.message, data: {}});
    })
})


router.post('/mobile/api/likeNews',verify ,async (req, res) => {
    News.findByIdAndUpdate(req.body.idNews,{$addToSet: {favoritePersons: req.account._id}},(error,r)=>{
        if (error){
            res.status(400).send({message: error.message,data:{}});
        }else{
           News.findById(req.body.idNews,async (error,result)=>{
               if (error){
                   res.status(400).send({message: error.message,data:{}});
               }else{
                   let account =await Account.findById(result.idOwner);
                   var current = new Date().getTime();
                   var timeRemain = Number(current-result.timeCreated);
                   let images = [];
                   for (var j=0;j<result.images.length;j++){
                       images.push(BASE_URL+result.images[j]);
                   }
                   if (req.account._id!=result.idOwner){
                       console.log("A");
                       Notification.findOne({typeNotification: 2,idDetail: result._id},async (err,data)=>{
                           if (err){
                               res.status(400).send({message: err.message,data:{}});
                           }
                           console.log(data);
                            var timeCreatedNoti = new  Date().getTime();
                           let currentAcc = await Account.findById(req.account._id);
                           if (data==null||data==undefined){
                               let notification = new Notification(
                                   {
                                       idOwner: result.idOwner,
                                       typeNotification: 2,
                                       timeCreated: timeCreatedNoti,
                                       isRead: false,
                                       idDetail: result._id,
                                       nameUserLastModify: currentAcc.fullName,
                                       avatar: currentAcc.avatar,
                                       content: result.favoritePersons.includes(result.idOwner)?Number(result.favoritePersons.length-2):result.favoritePersons.length-1
                                   }
                               )

                               notification.save((error,d)=>{
                                   var curTime = new Date().getTime();
                                   console.log(d);
                                   var timeRemainNotifi = Number(curTime-notification.timeCreated);
                                   const message = {
                                       data: {
                                           idOwner: result.idOwner,
                                           typeNotification: 2,
                                           timeCreated: timeCreatedNoti,
                                           isRead: false,
                                           idDetail: result._id,
                                           nameUserLastModify: currentAcc.fullName,
                                           avatar: currentAcc.avatar,
                                           content: result.favoritePersons.includes(result.idOwner)?Number(result.favoritePersons.length-2):result.favoritePersons.length-1,
                                           timeRemain: timeRemainNotifi,
                                       },
                                       tokens: account.idToken,
                                   }
                                   // admin.messaging().send(message)
                                   //     .then((response) => {
                                   //         // Response is a message ID string.
                                   //         console.log('Successfully sent message:', response);
                                   //     })
                                   //     .catch((error) => {
                                   //         console.log('Error sending message:', error);
                                   //     });
                               })
                           }else {
                               let notification =await  Notification.findByIdAndUpdate(data._id,{ timeCreated: timeCreatedNoti,
                                    isRead: false,
                                    nameUserLastModify: currentAcc.fullName,
                                    avatar: currentAcc.avatar,
                                    content: result.favoritePersons.includes(result.idOwner) ? Number(result.favoritePersons.length - 2) : result.favoritePersons.length - 1,
                                });
                                var curTime = new Date().getTime();
                                var timeRemainNotifi = Number(curTime - notification.timeCreated);
                                const message = {
                                    data: {
                                        typeNotification: 2,
                                        timeCreated: notification.timeCreated,
                                        isRead: false,
                                        idDetail: notification.idDetail,
                                        nameUserLastModify: notification.nameUserLastModify,
                                        avatar: notification.avatar,
                                        content: notification.content,
                                        timeRemain: timeRemainNotifi,
                                    },
                                    tokens: account.idToken,
                                }
                            }
                        })
                    }
                    res.status(200).send({
                        message: "success", data: {
                            news: {
                                _id: result._id,
                                isLike: true,
                                images: images,
                                favoritePersons: result.favoritePersons,
                                idComments: result.idComments,
                                idReporters: result.idReporters,
                                idOwner: result.idOwner,
                                timeCreated: result.timeCreated,
                                content: result.content,
                                isLocked: result.isLocked,
                                timeRemain: timeRemain,
                                account: {
                                    _id: account._id,
                                    avatar: BASE_URL + account.avatar,
                                    fullName: account.fullName,
                                },
                            }
                        }
                    });
                }
            })
        }
    })
})
router.post('/mobile/api/unlikeNews', verify, async (req, res) => {
    News.findByIdAndUpdate(req.body.idNews, {$pull: {favoritePersons: req.account._id}}, (error, r) => {
        if (error) {
            res.status(400).send({message: error.message, data: {}});
        } else {
            News.findById(req.body.idNews, async (error, result) => {
                if (error) {
                    res.status(400).send({message: error.message, data: {}});
                } else {
                    let account = await Account.findById(result.idOwner);
                    var current = new Date().getTime();
                    var timeRemain = Number(current - result.timeCreated);
                    let images = [];
                    for (var j = 0; j < result.images.length; j++) {
                        images.push(BASE_URL + result.images[j]);
                    }
                    if (req.account._id != result.idOwner) {
                        Notification.findOne({typeNotification: 2, idDetail: result._id}, async (err, data) => {
                            if (err) {
                                res.status(400).send({message: err.message, data: {}});
                            }
                            var timeCreatedNoti = new Date().getTime();
                            let currentAcc = await Account.findById(req.account._id);
                            if (data != null && data != undefined) {
                                if (result.favoritePersons.length == 0) {
                                    Notification.findByIdAndDelete(data._id);
                                } else if (result.favoritePersons.length == 1) {
                                    if (result.favoritePersons.includes(result.idOwner)) {
                                        Notification.findByIdAndDelete(data._id);
                                    }
                                } else {
                                    let lastAccount = await Account.findById(result.favoritePersons[Number(result.favoritePersons.length - 1)]);
                                    let notification = await Notification.findByIdAndUpdate(data._id, {
                                        nameUserLastModify: lastAccount.fullName,
                                        avatar: lastAccount.avatar,
                                        content: result.favoritePersons.includes(result.idOwner) ? Number(result.favoritePersons.length - 1) : result.favoritePersons.length,
                                    });
                                    var curTime = new Date().getTime();
                                    var timeRemainNotifi = Number(curTime - notification.timeCreated);
                                    const message = {
                                        data: {
                                            typeNotification: 2,
                                            timeCreated: notification.timeCreated,
                                            isRead: false,
                                            idDetail: notification.idDetail,
                                            nameUserLastModify: notification.nameUserLastModify,
                                            avatar: notification.avatar,
                                            content: notification.content,
                                            timeRemain: timeRemainNotifi,
                                        },
                                        tokens: currentAcc.idToken,
                                    }
                                }
                            }
                        })
                    }

                    res.status(200).send({
                        message: "success", data: {
                            news: {
                                _id: result._id,
                                isLike: false,
                                images: images,
                                favoritePersons: result.favoritePersons,
                                idComments: result.idComments,
                                idReporters: result.idReporters,
                                idOwner: result.idOwner,
                                timeCreated: result.timeCreated,
                                content: result.content,
                                isLocked: result.isLocked,
                                timeRemain: timeRemain,
                                account: {
                                    _id: account._id,
                                    avatar: BASE_URL + account.avatar,
                                    fullName: account.fullName,
                                },
                            }
                        }
                    });
                }
            })
        }
    })
})

router.post('/mobile/api/reportNews', verify, async (req, res) => {
    News.findByIdAndUpdate(req.body.idNews, {$addToSet: {idReporters: req.account._id}}, (error, r) => {
        if (error) {
            res.status(400).send({message: error.message, data: {}});
        } else {
            res.status(200).send({message: "success", data: {}});
        }
    })
})

router.post('/mobile/api/deleteNews',verify ,async (req, res) => {
    News.findByIdAndDelete(req.body.idNews, (err, result) => {
        if (err) {
            res.status(400).send({message: err.message, data: {}});
        } else {
            for (let i = 0; i < result.images.length; i++) {
                fs.unlink("uploads/" + result.images[i], function (error, da) {
                    if (error) {
                        console.log(error.message);
                    } else {
                        console.log("ok")
                    }
                });
            }
            Comment.deleteMany({idNews: result._id}, (error, result) => {
                if (error) {
                    res.status(400).send({message: err.message, data: {}});
                } else {
//                    res.status(200).send({message: "success", data: {}});
                    Account.findByIdAndUpdate(req.account._id, {$pull: {idNews: req.body.idNews}});
                    Comment.deleteMany({idNews: req.body.idNews}, (error, result) => {
                        if (error) {
                            res.status(400).send({message: err.message, data: {}});
                        } else {
                            res.status(200).send({message: "success", data: {}});
                        }
                    })
                    Notification.deleteMany({idDetail: req.body.idNews});

                }
            })
        }
    })
})


    router.post('/mobile/api/deleteComment', verify, async (req, res) => {
        Comment.findByIdAndDelete(req.body.idComment, async (err, result) => {
            if (err) {
                res.status(400).send({message: err.message, data: {}});
            } else {
                let news = await News.findByIdAndUpdate(result.idNews, {$pull: {idComments: result._id.toString()}});
                if (req.account._id != news.idOwner) {
                    let listUserComment = [];
                    for (var i = 0; i < news.idComments; i++) {

                        let comment = await Comment.findById(news.idComments[i]);
                        if (listUserComment.includes(comment.idOwner) == false && comment.idOwner != news.idOwner) {
                            listUserComment.push(comment.idOwner);
                        }
                    }
                    if (listUserComment.length == 0) {
                        Notification.findOneAndDelete({typeNotification: 3, idDetail: news._id});
                    } else if (listUserComment.length == 1 && listUserComment.includes(news.idOwner)) {
                        Notification.findOneAndDelete({typeNotification: 3, idDetail: news._id});
                    } else {
                        let lastAccount = await Account.findById(listUserComment[listUserComment.length - 1]);
                        Notification.findOneAndUpdate({typeNotification: 3, idDetail: news._id}, {
                            isRead: false,
                            nameUserLastModify: lastAccount.fullName,
                            avatar: lastAccount.avatar,
                            content: listUserComment.length - 1,
                        })
                    }

                }

                res.status(200).send({message: "success", data: {}});

            }
        })
    })
    router.post('/mobile/api/reportComment', verify, async (req, res) => {
        Comment.findByIdAndUpdate(req.body.idComment, {$addToSet: {idReporters: req.account._id}}, (error, r) => {
            if (error) {
                res.status(400).send({message: error.message, data: {}});
            } else {
                res.status(200).send({message: "success", data: {}});
            }
        })
    })

    router.get('/mobile/api/detailNews', verify, async (req, res) => {
        let id = req.query.id;
        News.findOne({_id: id, isLocked: false}, async (err, news) => {
            if (err) {
                res.status(401).send({
                    message: err.message,
                    data: {}
                });
            } else {
                let isLike = false;
                if (news.favoritePersons.length != null && news.favoritePersons.length != undefined && news.favoritePersons.length != 0 && news.favoritePersons.includes(req.account._id)) {
                    isLike = true;
                }
                let account = await Account.findById(news.idOwner);
                var current = new Date().getTime();
                var timeRemain = Number(current - news.timeCreated);
                let images = [];
                for (var j = 0; j < news.images.length; j++) {
                    images.push(BASE_URL + news.images[j]);
                }
                res.status(200).send({
                    message: "Success", data: {
                        _id: news._id,
                        isLike: isLike,
                        images: images,
                        favoritePersons: news.favoritePersons,
                        idComments: news.idComments,
                        idReporters: news.idReporters,
                        idOwner: news.idOwner,
                        timeCreated: news.timeCreated,
                        content: news.content,
                        isLocked: news.isLocked,
                        timeRemain: timeRemain,
                        account: {
                            _id: account._id,
                            avatar: BASE_URL + account.avatar,
                            fullName: account.fullName,
                        }
                    }
                });
            }
        });
    })

    router.get('/mobile/api/detailNewsV2', verify, async (req, res) => {
        let id = req.query.id;
        News.findOne({_id: id, isLocked: false}, async (err, news) => {
            if (err) {
                res.status(401).send({
                    message: err.message,
                    data: {}
                });
            } else {
                let isLike = false;
                if (news.favoritePersons.length != null && news.favoritePersons.length != undefined && news.favoritePersons.length != 0 && news.favoritePersons.includes(req.account._id)) {
                    isLike = true;
                }
                let account = await Account.findById(news.idOwner);
                var current = new Date().getTime();
                var timeRemain = Number(current - news.timeCreated);
                let images = [];
                for (var j = 0; j < news.images.length; j++) {
                    images.push(BASE_URL + news.images[j]);
                }
                res.status(200).send({
                    message: "Success", data: {
                        _id: news._id,
                        isLike: isLike,
                        images: images,
                        favoritePersons: news.favoritePersons.length,
                        idComments: news.idComments.length,
                        extensionNews: news.idOwner != account._id ? 0 : 1,
                        content: news.content,
                        timeRemain: timeRemain,
                        avatar: BASE_URL + account.avatar,
                        fullName: account.fullName,
                    }
                });
            }
        });
    })


    router.post('/web/api/getListCommentReported', async (req, res) => {
        let limit = req.body.limit == undefined ? 5 : Number(req.body.limit);
        let page = req.body.page == undefined ? 0 : Number(req.body.page);
        Comment.find({"idReporters.0": {"$exists": true}}, {}, {
            skip: page * limit,
            limit: limit
        }, async (err, data) => {
            console.log(data);
            if (err) {
                res.status(400).send({message: err.message, data: {}});
            } else {
                let listComment = [];
                if (data.length != null && data.length != undefined && data.length > 0) {
                    for (var i = 0; i < data.length; i++) {
                        let account = await Account.findById(data[i].idOwner);
                        listComment.push({
                            _id: data[i]._id,
                            content: data[i].content,
                            idOwner: data[i].idOwner,
                            idReporters: data[i].idReporters,
                            idNews: data[i].idNews,
                            isLocked: data[i].isLocked,
                            timeCreated: data[i].timeCreated,
                            account: {
                                _id: account._id,
                                avatar: BASE_URL + account.avatar,
                                fullName: account.fullName,
                            },
                        })
                    }
                }
                res.status(200).send({
                    message: "success", data: {
                        listComment: listComment
                    }
                });
            }
        }).sort({$natural: -1})
    })
    router.post('/web/api/getListNewsReported', async (req, res) => {
        let limit = req.body.limit == undefined ? 5 : Number(req.body.limit);
        let page = req.body.page == undefined ? 0 : Number(req.body.page);
        News.find({"idReporters.0": {"$exists": true}}, {}, {skip: page * limit, limit: limit}, async (err, data) => {
            if (err) {
                res.status(400).send({message: err.message, data: {}});
            } else {
                let listNews = [];
                if (data.length != null && data.length != undefined && data.length != 0) {
                    for (let i = 0; i < data.length; i++) {
                        let account = await Account.findById(data[i].idOwner);
                        listNews.push({
                            _id: data[i]._id,
                            images: data[i].images,
                            favoritePersons: data[i].favoritePersons,
                            idComments: data[i].idComments,
                            idReporters: data[i].idReporters,
                            idOwner: data[i].idOwner,
                            timeCreated: data[i].timeCreated,
                            content: data[i].content,
                            isLocked: data[i].isLocked,
                            account: {
                                _id: account._id,
                                avatar: BASE_URL + account.avatar,
                                fullName: account.fullName,
                            }
                        });
                    }
                }
                res.status(200).send({
                    message: "success", data: {
                        listNews: listNews
                    }
                });
            }
        }).sort({$natural: -1})
    })
    router.post('/web/api/banNews', async (req, res) => {
        News.findByIdAndUpdate(req.body.idNews, {isLocked: true, dateLocked: new Date().getTime()}, (err, news) => {
            if (err) {
                res.status(400).send({message: err.message, data: {}});
            } else {
                res.status(200).send({message: "success", data: {}});
            }
        })
    })
    router.post('/web/api/unBanNews', async (req, res) => {
        News.findByIdAndUpdate(req.body.idNews, {isLocked: false, dateLocked: ""}, (err, news) => {
            if (err) {
                res.status(400).send({message: err.message, data: {}});
            } else {
                res.status(200).send({message: "success", data: {}});
            }
        })
    })
    router.post('/web/api/banComment', async (req, res) => {
        Comment.findByIdAndUpdate(req.body.idComment, {
            isLocked: true,
            dateLocked: new Date().getTime()
        }, (err, result) => {
            if (err) {
                res.status(400).send({message: err.message, data: {}});
            } else {
                res.status(200).send({message: "success", data: {}});
            }
        })
    })
    router.post('/web/api/unbanComment', async (req, res) => {
        Comment.findByIdAndUpdate(req.body.idComment, {isLocked: false, dateLocked: ""}, (err, result) => {
            if (err) {
                res.status(400).send({message: err.message, data: {}});
            } else {
                res.status(200).send({message: "success", data: {}});
            }
        })
    })


module.exports = router;