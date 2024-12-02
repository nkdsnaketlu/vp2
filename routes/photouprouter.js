const express = require("express");
const router = express.Router(); //suur "R" on oluline!!!
const bodyparser = require("body-parser");
const general = require("../generalfmc");
//failide أ¼leslaadimiseks
const multer = require("multer");
//seadistame vahevara multer fotode laadimiseks kindlasse kataloogi
const upload = multer({dest: "./public/gallery/orig/"});
const {
	photouploadPage,
	photoUpload
	
} = require("../controllers/photoupcontroller");

//kõikidele marsruudidele vahevara checkLogin
router.use(general.checkLogin);

router.route("/").get(photouploadPage);

router.route("/").post(upload.single("photoInput"), photoUpload);

module.exports = router;


