const express = require('express');
const router = express.Router();
const Breed = require('../../model/breed');
const TypePet = require('../../model/typepet');






router.get('/',async (req, res) => {
    let breedL = await Breed.find({}).lean();
    let breedList = []
    let name = ""
    let typeList = await TypePet.find({}).lean();
    for (let i = 0 ;i<breedL.length;i++){
       let typeL =  await TypePet.find({_id:breedL[i].idType});
        for(let j = 0;j<typeL.length;j++){
            breedList.push({
                name:breedL[i].name,
                description:breedL[i].description,
                _id:breedL[i]._id,
                type:typeL[j].name
            })
        }

    }
    console.log(breedList)
    res.render('breed',{breedList : breedList,typeList : typeList});
});


router.post('/createBreed', async (req, res) => {

    let nameBreedCreate = req.body.nameBreedCreate;
    let  idType = req.body.idType;
    let description = req.body.description;
    let breedL = await Breed.find({}).lean();
    let typeList = await TypePet.find({}).lean();
    let breedList = []

    for (let i = 0 ;i<breedL.length;i++){
        let typeL =  await TypePet.find({_id:breedL[i].idType});
        for(let j = 0;j<typeL.length;j++){
            breedList.push({
                name:breedL[i].name,
                description:breedL[i].description,
                _id:breedL[i]._id,
                type:typeL[j].name
            })
        }
    }

   console.log("adsa " + nameBreedCreate);

    if (nameBreedCreate != ""){
        const breed = new Breed({
            name: nameBreedCreate,
            idType: idType,
            description: description,
        });

        breed.save((err, result) => {
            if (err) {
                res.redirect('/breed');
            } else {
                console.log(result._id);
                TypePet.update({_id: result.idType},{$push:{idBreeds: result._id.toString()}}, function (err, kq){
                    res.redirect('/breed');
                });
            }
        })
    }else{
        res.render('breed', {isShow: true, alertMessage: " Vui lòng không để trống khi thêm!",breedList : breedList,typeList : typeList});
    }


});

router.post('/deleteBreed', async (req, res) => {
    let id= req.body.idBreedDelete;
    console.log(id)
    if (id !== null && id !== "" && id !== undefined){
        TypePet.findOne({idBreeds: id}, function (err, typePet){
            if (err){
                res.redirect('/breed');
            } else if (typePet){
                var idx = typePet.idBreeds ? typePet.idBreeds.indexOf(id) : -1;
                if (idx != -1){
                    typePet.idBreeds.splice(idx, 1);
                    typePet.save(function (err){
                        if (err){

                        }else {
                            Breed.findByIdAndDelete({_id: id}, function (err, result) {
                                if (err) {
                                    res.redirect('/breed');
                                } else {
                                    let breedList =  Breed.find({}).lean();
                                    res.render('breed',{breedList : breedList});
                                }
                            });
                        }
                    })
                }
            }
            res.redirect('/breed');
        });
    }else {
        res.redirect('/breed');
    }
});

router.post('/updateBreed', async (req, res) => {
    let id = req.body.idBreedUpdate;
    let name = req.body.nameBreedUpdate;
    let description = req.body.descriptionView
    Breed.findByIdAndUpdate(id, {name: name,description: description }, function (err, result) {
        if (err) {
            res.redirect('/breed');
        } else {
            res.redirect('/breed');
        }
    })
});

module.exports = router;
