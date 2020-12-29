let express = require('express');
let router = express.Router();
const bodyparser = require('body-parser');
let multer = require('multer');
const fs = require('fs');
const verify = require('./verifyToken');
const request = require('request');
const BASE_URL = require('../ultil/SocketConstant').BASE_URL
var download = function (uri, filename, callback) {
    if (!fs.existsSync('./uploads/avatarUser')) {
        fs.mkdirSync('./uploads/avatarUser');
    }
    request.head(uri, function (err, res, body) {
        console.log('content-type:', res.headers['content-type']);
        console.log('content-length:', res.headers['content-length']);
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};
let storage = multer.diskStorage({
    destination: function (request, file, cb) {
        cb(null, './uploads/avatarUser');
    },
    filename: function (req, file, callback) {
        const hrtime = process.hrtime();
        callback(null, "avt" + ((hrtime[0] * 1e6) + (hrtime[1]) * 1e-3).toString() + file.originalname);
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
}).single('avatar');
router.use(bodyparser.urlencoded({extended: true}));
router.use(bodyparser.json());
const Account = require('../model/account');
const Pet = require('../model/pet');
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = process.env.SECRET_TOKEN || "doublep-scret";
const bcrypt = require('bcrypt');


router.post('/mobile/api/register', async (req, res) => {
    if (!fs.existsSync('./uploads/avatarUser')) {
        fs.mkdirSync('./uploads/avatarUser');
    }
    upload(req, res, async function (err) {
        if (err) {
            res.status(401).send({message: err.message, data: {}});
        }
        const account = new Account({
            phoneNumber: req.body.phoneNumber,
            password: req.body.password,
            fullName: req.body.fullName,
            typeAccount: 0,
            isShowUpdatePet: true,
            province: req.body.province,
            district: req.body.district,
            commune: req.body.commune,
            idToken: [req.body.idToken],
            isLocked: false,
        });
        if (req.file == undefined) {
            account.avatar = "file_config/default_avt.jpg";
        } else {
            let avt = req.file.path;
            account.avatar = avt.substring(8, avt.length);
            console.log(req.file.path);
        }
        await Account.findOne({'phoneNumber': account.phoneNumber}).then(data => {
            if (data == null) {
                try {
                    bcrypt.genSalt(10, (err, salt) => {
                        if (err) {
                            res.status(401).send({message: err.message, data: {}});
                        } else {
                            bcrypt.hash(account.password, salt, (err, hash) => {
                                if (err) {
                                    res.status(401).send({message: err});
                                } else {
                                    account.password = hash;
                                    account.save((err, result) => {
                                        if (err) {
                                            if (req.file != undefined) {
                                                fs.unlink(req.file.path, function (error, da) {
                                                    if (error) {
                                                        console.log(error.message);
                                                    } else {
                                                        console.log("error")
                                                    }
                                                });
                                            }
                                            res.status(401).send({message: "Failed", data: {}});
                                        } else {
                                            const token = jwt.sign({_id: account._id}, SECRET_TOKEN);
                                            res.status(200).header("Authorization", token).send({
                                                message: "Success", data: {
                                                    token: token,
                                                    account: {
                                                        idPets: account.idPets,
                                                        idNews: account.idNews,
                                                        idGroup: account.idGroup,
                                                        idToken: account.idToken,
                                                        idNotification: account.idNotification,
                                                        _id: account._id,
                                                        phoneNumber: account.phoneNumber,
                                                        fullName: account.fullName,
                                                        typeAccount: account.typeAccount,
                                                        isShowUpdatePet: account.isShowUpdatePet,
                                                        avatar: BASE_URL + account.avatar,
                                                        province: account.province,
                                                        commune: account.commune,
                                                        district: account.district,
                                                    }
                                                }
                                            });
                                        }
                                    });
                                }
                            })
                        }
                    })
                } catch (e) {
                    if (req.file != undefined) {
                        fs.unlink(req.file.path, function (error, da) {
                            if (error) {
                                console.log(error.message);
                            } else {
                                console.log("error")
                            }
                        });
                    }
                    res.status(400).send({message: e.message, data: {}});

                }
            } else {
                if (req.file != undefined) {
                    fs.unlink(req.file.path, function (error, da) {
                        if (error) {
                            console.log(error.message);
                        } else {
                            console.log("error")
                        }
                    });
                }
                res.status(401).send({message: "account has been existed", data: {}});

            }
        }).catch(e => {
            if (req.file != undefined) {
                fs.unlink(req.file.path, function (error, da) {
                    if (error) {
                        console.log(error.message);
                    } else {
                        console.log("error")
                    }
                });
            }
            res.status(400).send({message: e.message, data: {}});

        });
    })
})

router.post('/mobile/api/login', async (req, res) => {
    console.log(req.body.phoneNumber)
    Account.findOne({
        phoneNumber: req.body.phoneNumber,
    }, (err, account) => {
        if (err) {
            res.status(401).send({message: err.message, data: {}}); //loi o day//
        } else if (account == null) {
            res.status(401).send({message: "Error number phone or password", data: {}});
        } else {
            bcrypt.compare(req.body.password, account.password, async(err, isMatch) =>  {
                if (err) {
                    res.status(401).send({
                        message: err.message,
                        data: {}
                    });
                } else if (isMatch == true) {
                    if (account.isLocked) {
                        res.status(403).send({message: "This account was banned. Please contact to Admin.", data: {}});
                    } else {
                        account = await Account.findOneAndUpdate({phoneNumber: account.phoneNumber}, {$addToSet: {idToken: req.body.idToken}}, (err, account) => {
                        });
                        const token = jwt.sign({_id: account._id}, SECRET_TOKEN);
                        res.status(200).header("Authorization", token).send({
                            message: "Success", data: {
                                token: token,
                                account: {
                                    idPets: account.idPets,
                                    idNews: account.idNews,
                                    idGroup: account.idGroup,
                                    idToken: account.idToken,
                                    idNotification: account.idNotification,
                                    _id: account._id,
                                    phoneNumber: account.phoneNumber,
                                    fullName: account.fullName,
                                    typeAccount: account.typeAccount,
                                    isShowUpdatePet: account.isShowUpdatePet,
                                    avatar: BASE_URL + account.avatar,
                                    longitude: account.longitude,
                                    latitude: account.latitude,
                                    currentPet: account.currentPet,
                                    province: account.province,
                                    commune: account.commune,
                                    district: account.district,
                                }
                            }
                        });
                    }
                } else {
                    res.status(401).send({message: "Error number phone or password", data: {}});
                }
            })
        }
    })

})

router.post('/mobile/api/loginFB', async (req, res) => {

    if (req.body.idUser == undefined || req.body.idUser == null) {
        res.status(401).send({message: "idUser undefine", data: {}});
    } else {
        await Account.findOne({
            idUser: req.body.idUser,
        }, async (err, account) => {
            if (err) {
                res.status(401).send({message: err.message, data: {}});
            } else if (account == null || account == undefined) {
                try {
                    const hrtime = process.hrtime();
                    let avt = req.body.avatar;
                    let fileName;
                    if (avt=="NULL"){
                        fileName="file_config/default_avt.jpg";
                    }else {
                       fileName= "avatarUser/avt" + ((hrtime[0] * 1e6) + (hrtime[1]) * 1e-3).toString() + avt.substring(63, req.body.avatar.length) + ".png";
                        download(req.body.avatar, "./uploads/" + fileName, function () {
                            console.log('done');
                        });
                    }
                    const account = new Account({
                        fullName: req.body.fullName,
                        typeAccount: 1,
                        idUser: req.body.idUser,
                        isShowUpdatePet: true,
                        avatar: fileName,
                        idToken: [req.body.idToken],
                        isLocked: false,
                    });
                    account.save((err, result) => {
                        if (err) {
                            res.status(401).send({message: err.message, data: {}});
                        } else {
                            const token = jwt.sign({_id: result._id}, SECRET_TOKEN);
                            res.status(200).header("Authorization", token).send({
                                message: "Success", data: {
                                    token: token,
                                    account: {
                                        idPets: account.idPets,
                                        idNews: account.idNews,
                                        idGroup: account.idGroup,
                                        idToken: account.idToken,
                                        idNotification: account.idNotification,
                                        _id: account._id,
                                        phoneNumber: account.phoneNumber,
                                        fullName: account.fullName,
                                        typeAccount: account.typeAccount,
                                        isShowUpdatePet: account.isShowUpdatePet,
                                        avatar: BASE_URL + account.avatar,
                                        idUser: account.idUser,
                                        province: account.province,
                                        commune: account.commune,
                                        district: account.district,
                                    }
                                }
                            });
                        }
                    });


                } catch (e) {
                    res.status(400).send({message: e.message, data: {}});
                }
            } else {
                if (account.isLocked) {
                    res.status(403).send({message: "This account was banned. Please contact to Admin.", data: {}});
                } else {
                   account = await Account.findOneAndUpdate({idUser: account.idUser}, {$addToSet: {idToken: req.body.idToken}}, (err, account) => {
                    });
                    const token = jwt.sign({_id: account._id}, SECRET_TOKEN);
                    res.status(200).header("Authorization", token).send({
                        message: "Success", data: {
                            token: token,
                            account: {
                                idPets: account.idPets,
                                idNews: account.idNews,
                                idGroup: account.idGroup,
                                idToken: account.idToken,
                                idNotification: account.idNotification,
                                _id: account._id,
                                phoneNumber: account.phoneNumber,
                                fullName: account.fullName,
                                typeAccount: account.typeAccount,
                                isShowUpdatePet: account.isShowUpdatePet,
                                avatar: BASE_URL + account.avatar,
                                longitude: account.longitude,
                                latitude: account.latitude,
                                currentPet: account.currentPet,
                                idUser: account.idUser,
                                province: account.province,
                                commune: account.commune,
                                district: account.district,
                            }
                        }
                    });
                }
            }
        })
    }

})

router.post('/mobile/api/updatePassword', async (req, res) => {

    Account.findOne({
        phoneNumber: req.body.phoneNumber,
    }, (err, account) => {
        if (err) {
            res.status(401).send(err);
        } else if (account == null || undefined || account.phoneNumber == null || account.phoneNumber == undefined) {
            res.status(401).send({message: "Error number phone or password", data: {}});
        } else {
            try {
                if (account.isLocked) {
                    res.status(403).send({message: "This account was banned. Please contact to Admin.", data: {}});
                } else {
                    bcrypt.genSalt(10, (err, salt) => {
                        if (err) {
                            res.status(401).send({message: err});
                        } else {
                            bcrypt.hash(req.body.newPassword, salt, (err, hash) => {
                                if (err) {
                                    res.status(401).send({message: err});
                                } else {
                                    account.password = hash;
                                    Account.findOneAndUpdate({phoneNumber: account.phoneNumber}, account, {}, (e, account) => {
                                        if (e) {
                                            res.status(400).send({message: e.message, data: {}});
                                        } else {
                                            res.status(200).send({message: "success", data: {}});

                                        }
                                    })

                                }
                            })
                        }
                    })
                }
            } catch (e) {
                res.status(400).send({message: e.message, data: {}});
            }
        }
    })

})


router.post('/mobile/api/checkPhoneNumber', async (req, res) => {
    Account.findOne({
        phoneNumber: req.body.phoneNumber,
    }, (err, account) => {
        if (err) {
            res.status(401).send({
                message: err.message,
                data: {}
            });
        } else if (account == null || undefined) {
            res.status(200).send({
                message: "OK",
                data: {
                    exist: false,
                }
            });
        } else {
            res.status(200).send({
                message: "OK",
                data: {
                    exist: true,
                    fullName: account.fullName,
                    phoneNumber: account.phoneNumber,
                }
            });
        }
    })

})
router.get('/mobile/api/statusUpdatePet', verify, async (req, res) => {
    let account = req.account;
    account.isShowUpdatePet = false;
    Account.findByIdAndUpdate(account._id, account, {}, (err) => {
        if (err) {
            res.status(401).send({
                message: err.message,
                data: {}
            });
        } else {
            res.status(200).send({
                message: "Success",
                data: {}
            });
        }
    })
})
router.post('/mobile/api/changeCurrentPet', verify, async (req, res) => {
    let account = req.account;
    account.currentPet = req.body.currentPet;
    Account.findByIdAndUpdate(account._id, account, {}, (err) => {
        if (err) {
            res.status(401).send({
                message: err.message,
                data: {}
            });
        } else {
            res.status(200).send({
                message: "Success",
                data: {}
            });
        }
    })
})

router.post('/mobile/api/changePassword', verify, async (req, res) => {
    let id = req.account._id;
    Account.findById(id, (err, account) => {
        if (err) {
            res.status(401).send({
                message: err.message,
                data: {}
            });
        } else {
            bcrypt.compare(req.body.password, account.password, (err, isMatch) => {
                if (err) {
                    res.status(401).send({
                        message: err.message,
                        data: {}
                    });
                } else if (isMatch == true) {
                    bcrypt.genSalt(10, (err, salt) => {
                        if (err) {
                            res.status(401).send({message: err});
                        } else {
                            bcrypt.hash(req.body.newPassword, salt, (err, hash) => {
                                if (err) {
                                    res.status(401).send({message: err});
                                } else {
                                    account.password = hash;
                                    Account.findOneAndUpdate({phoneNumber: account.phoneNumber}, account, {}, (e, account) => {
                                        if (e) {
                                            res.status(400).send({message: e.message, data: {}});
                                        } else {
                                            res.status(200).send({message: "success", data: {}});

                                        }
                                    })

                                }
                            })
                        }
                    })
                } else {
                    res.status(401).send({message: "Password is not correct", data: {}});
                }
            })
        }
    })

})

router.post('/mobile/api/updateProfile', verify, async (req, res) => {
    if (!fs.existsSync('./uploads/avatarUser')) {
        fs.mkdirSync('./uploads/avatarUser');
    }
    upload(req, res, async function (err) {
        if (err) {
            res.status(401).send({message: err.message, data: {}});
        }
        const id = req.account._id;
        Account.findById(id, (err, account) => {
            if (req.body.fullName != undefined) account.fullName = req.body.fullName;
            if (req.body.phoneNumber != undefined) account.phoneNumber = req.body.phoneNumber;
            if (req.body.province != undefined) account.province = req.body.province;
            if (req.body.district != undefined) account.district = req.body.district;
            if (req.body.commune != undefined) account.commune = req.body.commune;

            if (req.file != undefined) {
                fs.unlink("uploads/" + account.avatar, function (error, da) {
                    if (error) {
                        console.log(error.message);
                    } else {
                        console.log("ok")
                    }
                });
                let avt = req.file.path;
                account.avatar = avt.substring(8, avt.length);
            }
            Account.findByIdAndUpdate(account._id, account, (err, acc) => {
                if (err) {
                    res.status(401).send({
                        message: err.message,
                        data: {}
                    });
                } else {
                    res.status(200).send({
                        message: "Success",
                        data: {}
                    });
                }
            })
        })

    })
})
router.get('/mobile/api/getProfile', verify, async (req, res) => {
    let id = req.account._id;
    Account.findById(id, (err, account) => {
        if (err) {
            res.status(401).send({
                message: err.message,
                data: {}
            });
        } else {
            res.status(200).send({
                message: "Success", data: {
                    account: {
                        idPets: account.idPets,
                        idNews: account.idNews,
                        idGroup: account.idGroup,
                        idToken: account.idToken,
                        idNotification: account.idNotification,
                        _id: account._id,
                        phoneNumber: account.phoneNumber,
                        fullName: account.fullName,
                        typeAccount: account.typeAccount,
                        isShowUpdatePet: account.isShowUpdatePet,
                        avatar: BASE_URL + account.avatar,
                        longitude: account.longitude,
                        latitude: account.latitude,
                        currentPet: account.currentPet,
                        idUser: account.idUser,
                        province: account.province,
                        commune: account.commune,
                        district: account.district,
                    }
                }
            });
        }
    })
})

router.get('/mobile/api/getInfoAccount', verify, async (req, res) => {
    let id = req.account._id;
    Account.findById(id, (err, account) => {
        if (err) {
            res.status(401).send({
                message: err.message,
                data: {}
            });
        } else {
            Pet.findById(account.currentPet, function (er, pet) {
                if (pet != null){
                    res.status(200).send({
                        message: "Success", data: {
                            account: {
                                fullName: account.fullName,
                                avatar: BASE_URL + account.avatar,
                                currentPet: account.currentPet,
                                namePet: pet.name == null? "": pet.name,
                                avatarPet: pet.avatar == null? "": BASE_URL+pet.avatar,
                            }
                        }
                    });
                }else {
                    res.status(200).send({
                        message: "Success", data: {
                            account: {
                                _id: account._id,
                                fullName: account.fullName,
                                isShowUpdatePet: account.isShowUpdatePet,
                                avatar: BASE_URL + account.avatar,
                                currentPet: account.currentPet,
                                idUser: account.idUser,
                                idPet:  "",
                                namePet:  "",
                                avatarPet:  "",
                            }
                        }
                    });
                }
            });

        }
    })
})

router.post('/mobile/api/updateLocation', verify, async (req, res) => {
    let account = req.account;
    account.longitude = req.body.longitude;
    account.latitude = req.body.latitude;
    Account.findByIdAndUpdate(account._id, account, {}, (err) => {
        if (err) {
            res.status(401).send({
                message: err.message,
                data: {}
            });
        } else {
            res.status(200).send({
                message: "Success",
                data: {}
            });
        }
    })

})

router.post('/web/api/getAllUser', async (req, res) => {
    let limit = req.body.limit == undefined ? 5 : Number(req.body.limit);
    let page = req.body.page == undefined ? 1 : Number(req.body.page);
    Account.find({}, {}, {skip: page * limit, limit: limit}, function (err, listAccount) {
        if (err) {
            res.status(401).send({
                message: err.message,
                data: {}
            });
        } else {
            res.status(200).send({
                message: "Success", data: {
                    listAccount: listAccount,
                    total: listAccount.length,
                }
            });
        }
    })

})
router.post('/web/api/banAccount', async (req, res) => {
    Account.findByIdAndUpdate(req.body._id, {isLocked: true, dateLock: req.body.dateLock}, (error, result) => {
        if (error) {
            res.status(401).send({
                message: error.message,
                data: {}
            });
        } else {
            res.status(200).send({message: "Success", data: {}});
        }
    })

})
router.post('/web/api/unBanAccount', async (req, res) => {

    Account.findByIdAndUpdate(req.body._id, {isLocked: false, dateLock: ""}, (error, result) => {
        if (error) {
            res.status(401).send({
                message: error.message,
                data: {}
            });
        } else {
            res.status(200).send({message: "Success", data: {}});
        }
    })

})


module.exports = router;
