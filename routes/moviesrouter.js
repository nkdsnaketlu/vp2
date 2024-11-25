const express = require("express");
const router = express.Router(); //suur "R" on oluline!!!
const bodyparser = require("body-parser");
const general = require("../generalfmc");
const {movieHome,
	movieCharacters,
	addMovieInfo,
	addingMovieInfo,
	movieRelations,
	addingRealtion,
	addedRelation} = require("../controllers/moviesController");

//kõikidele marsruudidele vahevara checkLogin
router.use(general.checkLogin);

router.route("/").get(movieHome);

router.route("/tegelased").get(movieCharacters);

router.route("/lisa").get(addMovieInfo);

router.route("/lisa").post(addingMovieInfo);

router.route("/personrelations/:id").get(movieRelations);

router.route("/lisaseos").get(addingRealtion);

router.route("/lisaseos").post(addedRelation);

module.exports = router;


