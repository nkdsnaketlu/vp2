const express = require("express");
const router = express.Router(); //suur "R" on oluline!!!
const general = require("../generalfmc");
const multer = require("multer");
const {
	//photoUpload,
	galleryOpenPage,
	galleryPage } = require("../controllers/gallerycontroller");

//kõikidele marsruudidele vahevara checkLogin
router.use(general.checkLogin);

router.route("/").get(galleryOpenPage);

router.route("/:page").get(galleryPage);

module.exports = router;


