const jwt = require('jsonwebtoken');
const SECRET_TOKEN = "doublep-scret";
const Account = require('../model/account');
module.exports= function auth (req,res,next){
    const token = req.header("Authorization");
    if (!token)return res.status(401).send({"message": "Access Denied"});

    try {
        const  verified = jwt.verify(token,SECRET_TOKEN);
        req.account=verified;
        Account.findById(req.account._id,(err,account)=>{
            if (err){
                res.status(401).send({message: err.message,data:{}});
            }else {
                if (account==null){
                    res.status(401).send({"message": "Invalid Token"});
                }else {
                    if (account.isLocked){
                        res.status(403).send({message: "This account was banned. Please contact to Admin.",data:{}});
                    }else {
                        next();
                    }
                }
            }
        })

    }catch (e) {
        res.status(401).send({"message": "Invalid Token"});
    }

}