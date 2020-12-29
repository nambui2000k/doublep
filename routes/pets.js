let express = require('express');
let router = express.Router();
const bodyparser = require('body-parser');
let multer = require('multer');
const fs = require('fs');
const verify = require('./verifyToken');
const jwt = require('jsonwebtoken');
const SECRET_TOKEN = process.env.SECRET_TOKEN||"doublep-scret";
const BASE_URL = process.env.BASE_URL||"http://doublep.tk/";

let storage = multer.diskStorage({
    destination: function (request, file, cb) {
        cb(null, './uploads/avatarPet');
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
const Pet = require('../model/pet');
const Breed = require('../model/breed');
const TypePet = require('../model/typepet');
const Account = require('../model/account');

router.post('/mobile/api/pet/create', verify, async (req, res) => {
    const id = req.account._id;
    if (!fs.existsSync('./uploads/avatarPet')){
        fs.mkdirSync('./uploads/avatarPet');
    }
    upload(req, res, async function (err) {
        if (err) {
            res.status(401).send({message: err.message, data: {}});
        }
        const pets = new Pet({
            sex: req.body.sex,
            color: req.body.color,
            weight: req.body.weight,
            height: req.body.height,
            idBreed: req.body.idBreed,
            birthday: req.body.birthday,
            origin: req.body.origin,
            idType: req.body.idType,
            name: req.body.name,
            idOwner: id
        });
        if (req.file == undefined) {
            pets.avatar = "file_config/default_avt.jpg";
        } else {
            let avt = req.file.path;
            pets.avatar = avt.substring(8, avt.length);
            console.log(req.file.path);
        }

        pets.save((err, result) => {
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
                Account.update({_id: id}, {$push: {idPets: result._id.toString()}}, function (err, kq) {
                    if (err) {
                        res.status(403).send({message: "Failed", data: err});
                    } else {
                        if (result.currentPet == null || result.currentPet == "") {
                            Account.findOneAndUpdate({_id: result.idOwner}, {currentPet: result._id.toString()}, function (err, kq) {
                                if (err) {
                                    res.status(403).send({message: "Failed", data: err});
                                } else {
                                    res.status(200).send({
                                        message: "Success", data: {
                                            pet: {
                                                _id:result._id,
                                                avatar:BASE_URL+result.avatar,
                                                sex:result.sex,
                                                color:result.color,
                                                weight:result.weight,
                                                height:result.height,
                                                idBreed:result.idBreed,
                                                birthday:result.birthday,
                                                origin:result.origin,
                                                idType:result.idType,
                                                name:result.name,
                                                idOwner:result.idOwner,
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    }
                });
            }
        });

    })
});

router.post('/mobile/api/pet/updatePet', verify, async (req, res) => {
    if (!fs.existsSync('./uploads/avatarPet')){
        fs.mkdirSync('./uploads/avatarPet');
    }
    upload(req, res, async function (err) {
        if (err) {
            res.status(401).send({message: err.message, data: {}});
        }
        Pet.findById(req.query.id, (err, pet) => {
            if (err){
                res.status(401).send({
                    message: "Lỗi",
                    data: "Không tìm thấy"
                });
            }else if (pet){
                if (req.body.sex != undefined) pet.sex = req.body.sex;
                if (req.body.color != undefined) pet.color = req.body.color;
                if (req.body.weight != undefined) pet.weight = req.body.weight;
                if (req.body.height != undefined) pet.height = req.body.height;
                if (req.body.idBreed != undefined) pet.idBreed = req.body.idBreed;
                if (req.body.birthday != undefined) pet.birthday = req.body.birthday;
                if (req.body.idType != undefined) pet.idType = req.body.idType;
                if (req.body.name != undefined) pet.name = req.body.name;
                if (req.body.origin != undefined) pet.origin = req.body.origin;
                if (req.file != undefined) {
                    fs.unlink("uploads" + pet.avatar.substring(16, pet.avatar.length), function (error, da) {
                        if (error) {
                            console.log(error.message);
                        } else {
                            console.log("error")
                        }
                    });
                    let avt = req.file.path;
                    pet.avatar = avt.substring(8, avt.length);
                }

                Pet.findByIdAndUpdate(req.query.id, pet, (err, acc) => {
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
            }
        })

    })
})

router.post('/mobile/api/pet/delete', verify, async (req, res) => {
    let id = req.body.id;

    if (id !== undefined && id !== null && id !== "") {
        Account.findOne({idPets: id}, function (err, account) {
                if (err) {
                    res.status(403).send({
                        message: "Error",
                        data1: ""
                    });
                } else if (account) {
                    var idx = account.idPets ? account.idPets.indexOf(id) : -1;
                    if (idx !== -1) {
                        account.idPets.splice(idx, 1);
                        account.save(function (error) {
                            if (error) {
                                res.send(null, 401);
                            } else {
                                Account.findOneAndUpdate({currentPet: id}, {currentPet: account.idPets[0]}, function (err1, account) {
                                    if (err1) {
                                        Pet.findByIdAndDelete({_id: id}, function (err, result) {
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
                                        });
                                    } else {
                                        Pet.findByIdAndDelete({_id: id}, function (err, result) {
                                            if (err) {
                                                res.status(401).send({
                                                    message: err.message,
                                                    data: {}
                                                });
                                            } else {
                                                res.status(200).send({
                                                    message: "Success",
                                                    data1: {}
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                        return;
                    }
                }
                res.status(403).send({
                    message: "Error",
                    data1: ""
                });
            }
        );
    }


});

router.get('/mobile/api/pet/typePet', verify, async (req, res) => {
    let typePet = await TypePet.find({}).lean();
    res.status(200).send({
        message: "Success", data: {
            typePet: typePet
        }
    });
});

router.get('/mobile/api/pet/breed', verify, async (req, res) => {
    Breed.find({idType: req.query.idType}, function (err, result) {
        if (err) {
            res.send(err);
        } else {
            res.status(200).send({
                message: "Success", data: {
                    result: result
                }
            });
        }
    });
    console.log(req.query.idType)
});

router.get('/mobile/api/pet', verify, async (req, res) => {
    let idOwner = req.account._id;
    Pet.find({idOwner: idOwner}, function (err, result) {
        if (err) {
            res.status(401).send({
                message: err.message,
                data: {}
            });
        } else {
            let listPet=[];
            for (let i =0;i <result.length; i++){
                listPet.push(
                    {
                        _id:result[i]._id,
                        name:result[i].name,
                        avatar:BASE_URL+result[i].avatar,
                    }
                )
            }
            res.status(200).send({
                message: "Success", data: {
                    pet: listPet
                }
            });
        }
    });
});

router.get('/mobile/api/detailCurrentPet', verify, async (req, res) => {

    Pet.findById(req.query.id, function (err, pet) {
        if (err || pet ==null) {
            res.status(401).send({
                message: err.message,
                data: {}
            });
        } else {
            res.status(200).send({
                message: "Success", data: {
                    _id: pet._id,
                    sex: pet.sex,
                    color: pet.color,
                    weight: pet.weight,
                    height: pet.height,
                    idBreed: pet.idBreed,
                    birthday: pet.birthday,
                    origin: pet.origin,
                    idType: pet.idType,
                    name: pet.name,
                    avatar: BASE_URL + pet.avatar,
                }
            });
        }
    });
});

router.get('/web/api/pet/typePet', async (req, res) => {
    TypePet.find({}, function (err, result) {
        if (err) {
            res.send(err);
        } else {
            res.status(200).send({
                message: "Success", data: {
                    typePet: result
                }
            });
        }
    });
});
router.get('/web/api/pet/breed', async (req, res) => {
    let idType = req.query.idType;
    if (idType !== "" && idType !== undefined && idType !== null) {
        Breed.find({idType: req.query.idType}, function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.status(200).send({
                    message: "Success", data: {
                        result: result
                    }
                });
            }
        });
    } else {
        Breed.find({}, function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.status(200).send({
                    message: "Success", data: {
                        result: result
                    }
                });
            }
        });
    }
});
router.post('/web/api/pet/typePet/create', async (req, res) => {
    const typePet = new TypePet({
        name: req.body.name,
        // idBreed: req.body.idBreed
    });
    typePet.save((err, result) => {
        if (err) {
            res.status(401).send({message: "Failed", data: {}});
        } else {
            res.status(200).send({
                message: "Success", data: result
            });
        }
    })
});
router.post('/web/api/pet/typePet/update', async (req, res) => {
    TypePet.findByIdAndUpdate({_id: req.query.id}, {name: req.body.name}, function (err, result) {
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
});
router.post('/web/api/pet/typePet/delete', async (req, res) => {
    TypePet.findByIdAndDelete({_id: req.query.id}, function (err, result) {
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
    });
});
router.post('/web/api/pet/breed/delete', async (req, res) => {
    let id= req.body.id;
    if (id !== null && id !== "" && id !== undefined){
        TypePet.findOne({idBreeds: id}, function (err, typePet){
            if (err){
                res.status(401).send({
                    message: "Lỗi",
                    data: "Không tìm thấy"
                });
            } else if (typePet){
                var idx = typePet.idBreeds ? typePet.idBreeds.indexOf(id) : -1;
                if (idx != -1){
                    typePet.idBreeds.splice(idx, 1);
                    typePet.save(function (err){
                        if (err){
                            res.status(401).send({
                                message: err.message,
                                data: {}
                            });
                        }else {
                            Breed.findByIdAndDelete({_id: id}, function (err, result) {
                                if (err) {
                                    res.status(401).send({
                                        message: err.message,
                                        data: {}
                                    });
                                } else {
                                    res.status(200).send({
                                        message: "Success",
                                        data: result
                                    });
                                }
                            });
                        }
                    })
                }
            }
            res.status(401).send({
                message: "Lỗi",
                data: "Không tìm thấy"
            });
        });
    }else {
        res.status(401).send({
            message: "Lỗi",
            data: {}
        });
    }
});
router.post('/web/api/pet/breed/create', async (req, res) => {
    const breed = new Breed({
        name: req.body.name,
        idType: req.body.idBreed
    });
    breed.save((err, result) => {
        if (err) {
            res.status(401).send({message: "Failed", data: {}});
        } else {
            console.log(result._id);
            TypePet.update({_id: result.idType},{$push:{idBreeds: result._id.toString()}}, function (err, kq){
                res.status(200).send({
                    message: "Success", data: kq
                });
            });
        }
    })
});
router.post('/web/api/pet/breed/update', async (req, res) => {
    Breed.findByIdAndUpdate({_id: req.query.id}, {name: req.body.name}, function (err, result) {
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
});

router.get('/mobile/api/getPetInMap', verify, async (req, res) => {
    Account.find(req.account._id,(err,account)=>{
        if (err){
            res.status(400).send({
                message: err.message,
                data: {}
            });
        }else {
            Pet.findById(account.currentPet,(err,pet)=>{
                if (err){
                    res.status(400).send({
                        message: err.message,
                        data: {}
                    });
                }else {
                    try{
                        let listPet = Pet.find({idType: pet.idType,sex: {'$ne':pet.sex}});
                        let listResult = [];
                        if (listPet!=null||listPet.length!=0||listPet!=undefined){
                            for (const element of listPet){
                                let p = _getPetByLongLa(element,account.longtitude,account.latitude);
                                if (p!=null&&p!=undefined){
                                    listResult.push({
                                        _id:element._id,
                                        sex:element.sex,
                                        color:element.color,
                                        weight:element.weight,
                                        height:element.height,
                                        idBreed:element.idBreed,
                                        birthday:element.birthday,
                                        origin:element.origin,
                                        idType:element.idType,
                                        name:element.name,
                                        idOwner:element.idOwner,
                                        avatar:BASE_URL+element.avatar,
                                    });
                                }
                            }
                            res.status(200).send({
                                message: "success",
                                data: {
                                    listPet: listResult,
                                }
                            });
                        }else {
                            res.status(400).send({
                                message: "error",
                                data: {}
                            });
                        }
                    } catch (e) {
                        res.status(400).send({
                            message: e.message,
                            data: {}
                        });
                    }
                }
            })
        }
    })
});

router.post('/mobile/api/filterPet', verify, async (req, res) => {
    Account.find(req.account._id,(err,account)=>{
        if (err){
            res.status(400).send({
                message: err.message,
                data: {}
            });
        }else {
            Pet.findById(account.currentPet,(err,pet)=>{
                if (err){
                    res.status(400).send({
                        message: err.message,
                        data: {}
                    });
                }else {
                    try{
                        let listPet = Pet.find({idType: pet.idType,idBreed: req.body.idBreed,age: req.body.age,height: req.body.height,weight: req.body.weight,sex: {'$ne':pet.sex}});
                        let listResult=[];
                        if (listPet!=null||listPet.length!=0||listPet!=undefined){
                            for (const element of listPet){
                                let p = _filterPet(element,req.body.province,req.body.commune,req.body.district);
                                if (p!=null&&p!=undefined){
                                    listResult.push({
                                        _id:element._id,
                                        sex:element.sex,
                                        color:element.color,
                                        weight:element.weight,
                                        height:element.height,
                                        idBreed:element.idBreed,
                                        birthday:element.birthday,
                                        origin:element.origin,
                                        idType:element.idType,
                                        name:element.name,
                                        idOwner:element.idOwner,
                                        avatar:BASE_URL+element.avatar,
                                    });
                                }

                            }
                            res.status(200).send({
                                message: "success",
                                data: {
                                    listPet: listResult,
                                }
                            });
                        }else {
                            res.status(400).send({
                                message: "error",
                                data: {}
                            });
                        }
                    } catch (e) {
                        res.status(400).send({
                            message: e.message,
                            data: {}
                        });
                    }
                }
            })
        }
    })
});

function _filterPet(pet,province,commune,district) {
    Account.find({idPets: pet._id,province: province,commune: commune,district: district},(err,acc)=>{
        if (err){
            return null;
        }else {
            if (acc!=null&&acc!=undefined){
                return pet;
            }else{
                return null;
            }
        }
    })
}
function _getPetByLongLa(pet,long1,lat1,) {
    Account.findById(pet.idOwner,(err,acc)=>{
        if (err){
            return null;
        }else {
            if (acc!=null&&acc!=undefined){
                if (_getDistanceFromLatLonInKm(lat1,long1,acc.latitude,acc.longitude)<=5){
                    pet.longtitude = acc.longitude;
                    pet.latitude=acc.latitude;
                    return pet;
                }else {
                    return  null;
                }
            }else {
                return null;
            }
        }
    })
}
function _getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    console.log(lat1);
    console.log(lat2);
    console.log(lon1);
    console.log(lon2);
    let R = 6371; // Radius of the earth in kilometers
    let dLat = deg2rad(lat2 - lat1); // deg2rad below
    let dLon = deg2rad(lon2 - lon1);
    let a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c; // Distance in KM
    return d;
}
function deg2rad(deg) {
    return deg * (Math.PI / 180)
}


module.exports = router;