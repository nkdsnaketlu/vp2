const express = require("express");
const router = express.Router(); //suur "R" on oluline!!!
const bodyparser = require("body-parser");
const general = require("../generalfmc");
const {newsHome,
	addNews,
	addingNews,
	newsList,
	getNews} = require("../controllers/newsController");

//kõikidele marsruudidele vahevara checkLogin
router.use(general.checkLogin);

//marsruudid
//kuna kõik on nagu nii "/news", siis lihtsalt "/"
//kuna tahame kasutada ka kontrollereid,siis .get tuleb järgi
router.route("/").get(newsHome);

router.route("/add").get(addNews);

router.route("/add").post(addingNews);

router.route("/read").get(newsList);

router.route("/readnews/:id").get(getNews);

module.exports = router;


