const express = require('express');
const router = express.Router();
const TypePet = require('../../model/typepet');
const Breed = require('../../model/breed');


router.get('/', async (req, res) => {
    let typeList = await TypePet.find({}).lean();
    res.render('typepet', {typeList: typeList});
});

router.post('/createType', async (req, res) => {
    let typeList = [];
    typeList = await TypePet.find({}).lean();
    try {
        let nameType = req.body.nameType;
        let description = req.body.description;
        if (nameType != undefined && nameType != null && nameType != ""){
            await new TypePet({
                name: nameType,
                description: description,
            }).save();
            typeList = await TypePet.find({}).lean();
            res.render('typepet', {isShow: true, alertMessage: "Thành công!!", typeList: typeList});
        }else {
            res.render('typepet', {isShow: true, alertMessage: "Vui lòng không để trống khi thêm!", typeList: typeList});
        }
    } catch (e) {
        res.render('typepet', {isShow: true, alertMessage: e.message, typeList: typeList});
    }

});

router.post('/deleteType', async (req, res) => {
    let id = req.body.id;

    TypePet.findById(id, function (err, result){
        if (err){

        }else {
            for (let i =0; i< result.idBreeds.length;i++){
                Breed.findByIdAndDelete(result.idBreeds[i], function (err1,result1){
                    if(err1){
                        console.log(err1)
                    }
                })
            }
            TypePet.findByIdAndDelete(id, function (aa,asd){
                if (aa){

                }else {
                    console.log(asd)
                    let typeList = TypePet.find({}).lean();
                    res.redirect('/typePet')
                }
            });

        }
    });


});

router.post('/update', async (req, res) => {
    let id = req.body.ids;
    let name = req.body.nameTypeUpdate;
    let description = req.body.descriptionView
    console.log(name)
    TypePet.findByIdAndUpdate(id,  {name:name, description:description}, function (err, result) {
        if (err) {
            res.redirect('/typePet');
        } else {
            res.redirect('/typePet');
        }
    })
});

module.exports = router;
