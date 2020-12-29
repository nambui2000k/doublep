const express = require('express');
const router = express.Router();
const verify = require('./verifyToken');
const Account = require('../model/account');

///To test mongo
router.get('/', async function(req, res, next) {
  let accountList = await Account.find({}).lean();
    res.send(accountList);
});

module.exports = router;
