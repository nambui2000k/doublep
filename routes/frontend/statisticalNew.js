const express = require('express');
const router = express.Router();
const Account = require('../../model/account');
const News = require('../../model/news');
const BASE_URL = process.env.BASE_URL || "http://doublep.tk/";


router.get('/',async (req, res) => {
    let listStatisticalNew = [];
    let news= [];
    let accountList = await Account.find({}).lean();
    for(let i=0;i<accountList.length;i++){
        news=  await News.find({idOwner:accountList[i]._id, isLocked : true});
        if (news.length > 1){
            if(accountList[i].isLocked == false){
                listStatisticalNew.push({
                    fullName: accountList[i].fullName,
                    _id : accountList[i]._id,
                    avatar: BASE_URL + accountList[i].avatar,
                    idReporters: news.length,
                    phoneNumber:accountList[i].phoneNumber,
                    commune:accountList[i].commune === "null" ? " " : accountList[i].commune,
                    district:accountList[i].district === "null" ? " " : accountList[i].district,
                    province:accountList[i].province === "null" ? " " : accountList[i].province,
                    isLocked:accountList[i].isLocked,
                    idPets:accountList[i].idPets,
                })
            }
        }
    }
    res.render('statisticalNews',{listStatisticalNew: listStatisticalNew});
});

router.post('/isLocked', async (req, res) => {
    let account= await Account.findById(req.body.idBan).lean();
    if (!account.isLocked){
        Account.findByIdAndUpdate(req.body.idBan,{isLocked: 1}, (err, rl)=>{
            if(err){
                console.log("Err");
            }else {
                res.redirect('/statisticalNew');
            }
        });
    }else{
        res.redirect('/statisticalNew');
    }
});

module.exports = router;