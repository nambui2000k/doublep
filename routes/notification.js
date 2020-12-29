let express = require('express');
let router = express.Router();
const bodyparser = require('body-parser');
let multer = require('multer');
const fs = require('fs');
const verify = require('./verifyToken');
const SECRET_TOKEN = process.env.SECRET_TOKEN || "doublep-scret";
const BASE_URL = process.env.BASE_URL || "http://doublep.tk/";
router.use(bodyparser.urlencoded({extended: true}));
router.use(bodyparser.json());
const Notification = require('../model/notification');
const News = require('../model/news');
const Comment = require('../model/comment');
const Account = require('../model/account');

router.post('/mobile/api/interactive/listNotification', verify, async (req, res) => {
    let limit = req.body.limit == undefined ? 20 : Number(req.body.limit);
    let page = req.body.page == undefined ? 0 : Number(req.body.page);
    let id = req.account._id;
    Notification.find({idOwner: id}, {}, {skip: page * limit, limit: limit}, function (err, notifications) {
        if (err) {
            res.send(res.status(401).send({message: "Failed", data: {}}))
        }
        if (notifications) {
            let listNotification = [];
            for (let i = 0; i < notifications.length; i++) {
                listNotification.push({
                    id: notifications[i]._id,
                    content: notifications[i].content,
                    typeNotification: notifications[i].typeNotification,
                    timeCreated: notifications[i].timeCreated,
                    isRead: notifications[i].isRead,
                    idDetail: notifications[i].idDetail,
                    nameUserLastModify: notifications[i].nameUserLastModify,
                    avatar: BASE_URL + notifications[i].avatar,
                })
            }
            listNotification.sort((s1, s2)=>s2.timeCreated -s1.timeCreated);
            res.status(200).send({
                message: "Success", data: {
                    notification: listNotification
                }
            });
        }
    });
});

router.post('/mobile/api/interactive/delete', verify, async (req, res) => {
    Notification.findByIdAndDelete(req.query.id, function (err, result) {
        if (err) {
            res.status(401).send({
                message: "Failed", data: {}
            });
        } else {
            res.status(200).send({
                message: "Success", data: {}
            });
        }
    })
});

router.get('/mobile/api/interactive/detailNewsBan', verify, async (req, res) => {
    let idDetail = req.query.idDetail;
    News.findById(idDetail, async (err, news) => {
        if (err) {
            res.status(401).send({
                message: "Failed", data: {}
            });
        }
        if (news) {
            let account = await Account.findById(news.idOwner);
            let listImage = [];
            for (let i = 0; i < news.images.length; i++) {
                listImage.push(`${BASE_URL + news.images[i]}`)
            }
            Notification.findOneAndUpdate({idDetail: idDetail, typeNotification:0}, {isRead: true}, function (err1, notification) {
                if (err1) {
                    res.status(401).send({
                        message: "Failed", data: {}
                    });
                } else {
                    res.status(200).send({
                        message: "Success", data: {
                            idNews: news.id,
                            avatarAccount: BASE_URL + account.avatar,
                            nameAccount: account.fullName,
                            timeCreated: news.timeCreated,
                            contentNews: news.content,
                            listImageNews: listImage,
                        }
                    });
                }
            })
        }
    })
});
router.get('/mobile/api/detailNewsNotification', verify, async (req, res) => {
    let idDetail = req.query.idDetail;
    let typeNotification = req.query.typeNotification;
    News.findOne({_id: idDetail, isLocked: false}, async (err, news) => {
        if (err) {
            Notification.findOneAndUpdate({
                idDetail: idDetail,
                typeNotification: typeNotification
            }, {isRead: true}, function (err1, notification) {
                if (err1) {
                    res.send(res.status(400).send({message: "Failed", data: {}}))
                } else {
                    res.status(401).send({
                        message: err.message,
                        data: {}
                    });
                }
            })
        }
        if (news != null) {
            let isLike = false;
            console.log(news);
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
            Notification.findOneAndUpdate({
                idDetail: idDetail,
                typeNotification: typeNotification
            }, {isRead: true}, function (err1, notification) {
                if (err1) {
                    res.send(res.status(401).send({message: "Failed", data: {}}))
                } else {
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
            })
        } else {
            res.status(401).send({
                message: "F",
                data: {}
            });
        }
    });
})


router.get('/mobile/api/interactive/detailCommentBan', verify, async (req, res) => {
    let idDetail = req.query.idDetail;
    if (idDetail == undefined) {
        res.status(403).send({message: "Failed", data: {}});
    } else {
        Comment.findById(idDetail, async (err, comments) => {
            if (err) {
                res.status(401).send({message: "Failed", data: {}});
            }
            if (comments) {
                let account = await Account.findById(comments.idOwner);
                Notification.findOneAndUpdate({idDetail: idDetail,typeNotification:1}, {isRead: true}, function (err1, notification) {
                    if (err1) {
                        res.send(res.status(401).send({message: "Failed", data: {}}))
                    } else {
                        res.status(200).send({
                            message: "Success", data: {
                                idComment: comments._id,
                                avatarAccount: BASE_URL + account.avatar,
                                nameAccount: account.fullName,
                                timeCreated: comments.timeCreated,
                                contentComment: comments.content,
                            }
                        });
                    }
                })
            }
        })
    }
});


module.exports = router;


