const express = require("express");
const router = express.Router(); //suur "R" on oluline!!!

//kontrollerid
const {weatherHome} = require("../controllers/weatherController");


//marsruudid
//kuna kأµik on nagunii "/weather", siis  lihtsalt "/"
//kuna tahame kasutada ka kontrollereid, siis .get tuleb jأ¤rgi
router.route("/").get(weatherHome);

module.exports = router;