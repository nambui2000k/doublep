const express = require('express');
const router = express.Router();
const Account = require('../../model/account');
const SocketConstant = require('../../ultil/SocketConstant')
const BASE_URL = process.env.BASE_URL || "http://doublep.tk/";


router.post('/', async (req, res) => {
    let val = req.body.sm;
    let accountList = []
    let username = req.body.username;
    let password = req.body.password;
    if (username == "" || password == "") {
        res.render('login', {isShow: true, alertMessage: 'Tài khoản hoặc mật khẩu không được để trống'});
    } else if (username != "admin" || password != "doublep") {
        res.render('login', {isShow: true, alertMessage: 'Sai tài khoản hoặc mật khẩu'});
    } else if (username === "admin" && password === "doublep") {
        let accountL = await Account.find({}).lean();
        for (let i = 0; i < accountL.length; i++) {
            accountList.push({
                _id: accountL[i]._id,
                fullName: accountL[i].fullName,
                phoneNumber: accountL[i].phoneNumber,
                commune: accountL[i].commune === "null" ? " " : accountL[i].commune,
                district: accountL[i].district === "null" ? " " : accountL[i].district,
                province: accountL[i].province === "null" ? " " : accountL[i].province,
                typeAccount: accountL[i].typeAccount === 1 ? true : false,
                isLocked: accountL[i].isLocked,
                avatar: BASE_URL+accountL[i].avatar,
                idPets: accountL[i].idPets,
            })
        }
        res.render('homev2', {accountList: accountList});
    }
})

router.get('/', async (req, res) => {
    let accountList = []
    let avatar = req.body.image;
    let accountL = await Account.find({}).lean();
    for (let i = 0; i < accountL.length; i++) {
        accountList.push({
            _id: accountL[i]._id,
            fullName: accountL[i].fullName,
            phoneNumber: accountL[i].phoneNumber,
            commune: accountL[i].commune === "null" ? " " : accountL[i].commune,
            district: accountL[i].district === "null" ? " " : accountL[i].district,
            province: accountL[i].province === "null" ? " " : accountL[i].province,
            typeAccount: accountL[i].typeAccount === 1,
            isLocked: accountL[i].isLocked,
            avatar: BASE_URL+accountL[i].avatar,
            idPets: accountL[i].idPets,
        })
    }
    res.render('homev2', {accountList: accountList});
});

router.post('/search', async (req, res) => {
    let key=req.body.nameUserSearch;
    let accountList = []
    let accountL = await Account.find({}).lean();
    for (let i = 0; i < accountL.length; i++) {
        if(key!="" && key != undefined && key != null){
            if(accountL[i].fullName.includes(key)){
                accountList.push({
                    _id: accountL[i]._id,
                    fullName: accountL[i].fullName,
                    phoneNumber: accountL[i].phoneNumber,
                    commune: accountL[i].commune === "null" ? " " : accountL[i].commune,
                    district: accountL[i].district === "null" ? " " : accountL[i].district,
                    province: accountL[i].province === "null" ? " " : accountL[i].province,
                    typeAccount: accountL[i].typeAccount === 1,
                    isLocked: accountL[i].isLocked,
                    avatar: BASE_URL+accountL[i].avatar,
                    idPets: accountL[i].idPets,
                })
            }  
        }else{
            accountList.push({
                _id: accountL[i]._id,
                fullName: accountL[i].fullName,
                phoneNumber: accountL[i].phoneNumber,
                commune: accountL[i].commune === "null" ? " " : accountL[i].commune,
                district: accountL[i].district === "null" ? " " : accountL[i].district,
                province: accountL[i].province === "null" ? " " : accountL[i].province,
                typeAccount: accountL[i].typeAccount === 1,
                isLocked: accountL[i].isLocked,
                avatar: BASE_URL+accountL[i].avatar,
                idPets: accountL[i].idPets,
            })
        }
             
    }
    res.render('homev2', {accountList: accountList});
});

router.post('/isLocked', async (req, res) => {
    let account = await Account.findById(req.body.idBan).lean();
    if (!account.isLocked) {
        Account.findByIdAndUpdate(req.body.idBan, {isLocked: 1}, (err, rl) => {
            if (err) {
                console.log("Err");
            } else {
                res.redirect('/user');
                const socketMap = req.socketMap
                const sockets = socketMap.get(req.body.idBan)
                if (sockets != null) {
                    sockets.forEach(v => {
                        v.emit(SocketConstant.ACTION_LOCK, SocketConstant.ACTION_LOCK)
                    })
                }
            }
        });
    } else {
        res.redirect('/user');
    }
});

router.post('/unLock', async (req, res) => {
    console.log(req.body.idUnban)
    let account = await Account.findById(req.body.idUnban).lean();
    console.log(account);
    if (account.isLocked) {
        Account.findByIdAndUpdate(req.body.idUnban, {isLocked: 0}, (err, rl) => {
            if (err) {
                console.log("Err");
            } else {
                res.redirect('/user');
            }
        });
    } else {
        res.redirect('/user');
    }
});

module.exports = router;
