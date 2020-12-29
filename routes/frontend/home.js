// const express = require('express');
// const router = express.Router();
// const Account = require('../../model/account');
//
//
// router.post('/', async (req, res) => {
//     let val = req.body.sm;
//     let accountList = []
//     let username = req.body.username;
//     let password = req.body.password;
//     if (username == "" || password == "") {
//         res.render('login', {isShow: true, alertMessage: 'Tài khoản hoặc mật khẩu không được để trống'});
//     }else if (username != "admin" || password != "admin"){
//         res.render('login', {isShow: true, alertMessage: 'Sai tài khoản hoặc mật khẩu'});
//     }
//     else if (username === "admin" && password === "admin"){
//         let accountL = await Account.find({}).lean();
//         for(let i=0;i<accountL.length;i++){
//             accountList.push({
//                 fullName:accountL[i].fullName,
//                 phoneNumber:accountL[i].phoneNumber,
//                 commune:accountL[i].commune === "null" ? " " : accountL[i].commune,
//                 district:accountL[i].district === "null" ? " " : accountL[i].district,
//                 province:accountL[i].province === "null" ? " " : accountL[i].province,
//                 typeAccount:accountL[i].typeAccount === 1 ? true : false,
//                 isLocked:accountL[i].isLocked,
//                 avatar:accountL[i].avatar,
//                 idPets:accountL[i].idPets,
//             })
//             console.log(accountList[0].typeAccount);
//         }
//         res.render('homev2',{accountList: accountList});
//     }
// })
//
// router.post('/isLocked/:id', async (req, res) => {
//     let account= await Account.findById(req.params.id).lean();
//     if (!account.isLocked){
//         Account.findByIdAndUpdate(req.params.id,{isLocked: 1}, (err, rl)=>{
//             if(err){
//                 console.log("Err");
//             }else {
//                 res.redirect('/homev2');
//             }
//         });
//     }else{
//         res.redirect('/homev2');
//     }
// });
//
// router.post('/unLock/:id', async (req, res) => {
//     let account= await Account.findById(req.params.id).lean();
//     if (account.isLocked){
//         Account.findByIdAndUpdate(req.params.id,{isLocked: 0}, (err, rl)=>{
//             if(err){
//                 console.log("Err");
//             }else {
//                 res.redirect('/homev2');
//             }
//         });
//     }else{
//         res.redirect('/homev2');
//     }
// });
//
//
// module.exports = router;
