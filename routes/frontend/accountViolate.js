const express = require('express');
const router = express.Router();
const Account = require('../../model/account');
const News = require('../../model/news');
const Comment = require('../../model/comment');
const BASE_URL = process.env.BASE_URL || "http://doublep.tk/";


router.get('/' ,async (req, res) => {

    Comment.find( {"idReporters.0" : { "$exists": true }} ,async (err,data)=>{
        if (err){
            res.status(400).send({message: err.message,data:{}});
        }else {
            let listComment = [];
            if (data.length!=null&&data.length!=undefined&&data.length!=0){
                for (let i = 0; i < data.length; i++){
                    let account= await Account.findById(data[i].idOwner)
                    News.find({idOwner: account._id})
                    listComment.push({
                        _id: data[i]._id,
                        idReporters: data[i].idReporters,
                        idOwner: data[i].idOwner,
                        timeCreated: data[i].timeCreated,
                        content: data[i].content,
                        isLocked: data[i].isLocked === true? "Đã thu hồi": "Chưa thu hồi",
                        account: {
                            _id: account._id,
                            avatar: BASE_URL + account.avatar,
                            fullName: account.fullName,
                        }
                    });
                }
            }
            res.render('banComment',{listComment: listComment});
        }})

});


module.exports = router;