const express = require('express');
const router = express.Router();
const Account = require('../../model/account');
const News = require('../../model/news');
const Comment = require('../../model/comment');
const Notification = require('../../model/notification');
const BASE_URL = process.env.BASE_URL || "http://doublep.tk/";


router.get('/' ,async (req, res) => {

    News.find( {"idReporters.0" : { "$exists": true },isLocked: false} ,async (err,data)=>{
        if (err){
            res.status(400).send({message: err.message,data:{}});
        }else {
            let listNews = [];
            let pagination = [];
            let number = data.length / 20;
            for (let i=1; i < number+1;i++){
                pagination.push(i);
            }
            if (data.length!=null&&data.length!=undefined&&data.length!=0){
                for (let i = 0; i < data.length; i++){
                    let account= await Account.findById(data[i].idOwner);
                    let imagesBase = [];
                    for(let j=0;j<data[i].images.length;j++){
                        imagesBase.push(BASE_URL + data[i].images[j]);
                    }
                    listNews.push({
                        _id: data[i]._id,
                        image:BASE_URL + data[i].images[0],
                        favoritePersons: data[i].favoritePersons,
                        idComments: data[i].idComments,
                        idReporters: data[i].idReporters,
                        idOwner: data[i].idOwner,
                        timeCreated: data[i].timeCreated,
                        imageList:imagesBase,
                        isLocked:data[i].isLocked === true ? "Đã thu hồi" : "Chưa thu hồi",
                        content: data[i].content,
                        account: {
                            _id: account._id,
                            avatar: BASE_URL + account.avatar,
                            fullName: account.fullName,
                        }
                    });

                }
            }
            res.render('banNew',{listNews: listNews, pagination: pagination });
        }}).sort({ $natural: -1 })
});

router.post('/isLocked', async (req, res) => {
    let news= await News.findById(req.body.id).lean();
    console.log(news);
    if (!news.isLocked){  News.findByIdAndUpdate(req.body.id,{isLocked: 1, dateLocked: new Date().getTime()}, (err, rl)=>{
        if(err){
            console.log("Err");
        }else {
            const notifications = new Notification({
                content: "Bài viết của bạn đã vi phạm điều khoản!",
                typeNotification: 0,
                timeCreated: new Date().getTime(),
                isRead: false,
                idDetail: news._id,
                nameUserLastModify: "",
                avatar: "file_config/LogoNoTextDefault.png",
                idOwner:news.idOwner
            });
            notifications.save((err, result)=>{
                if (err){
                }
                if (result){
                    console.log(result);
                }
            })
            res.redirect('/ban');
        }

    });
    }else {
        res.redirect('/ban');
    }


});

module.exports = router;