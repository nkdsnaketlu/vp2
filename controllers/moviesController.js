const mysql = require("mysql2");
const dbInfo = require("../../../vp2024config");
const asyn = require("async");
const conn = mysql.createConnection({
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
});

//@desc home page for movies
//@route GET /api/movies
//@access private

const movieHome = (req, res) => {
	res.render("eestifilm");
};

//@desc page for movies characters list
//@route GET /api/movies
//@access private

const movieCharacters = (req, res) => {
	let sqlReq = "SELECT id, first_name, last_name, birth_date FROM person";
	conn.query(sqlReq, (err, sqlRes)=>{
		if(err){
			res.render("tegelased", {persons: []});
		}
		else {
			console.log(sqlRes);
			res.render("tegelased", {persons: sqlRes});
		}
	});
};

//@desc added movie information
//@route GET /api/movies
//@access private

const addMovieInfo = (req, res)=>{
	let sqlReq = "";
	res.render("addmovieinfo");
}

//@desc page to add movie information
//@route GET /api/movies
//@access private

const addingMovieInfo = (req, res)=>{
	let sqlReq = "";
    let values = "";
    if (req.body.movieNameInput) {
        sqlReq = "INSERT INTO movie (title, duration, production_year) VALUES (?, ?, ?)";
        values = [req.body.movieNameInput, req.body.movieDurationInput, req.body.productionYearInput];
    } else if (req.body.firstNameInput) {
        sqlReq = "INSERT INTO person (first_name, last_name, birth_date) VALUES (?, ?, ?)";
        values = [req.body.firstNameInput, req.body.lastNameInput, req.body.birthDateInput];
    } else if (req.body.characterNameInput) {
        sqlReq = "INSERT INTO person_in_movie (role, movie_id, person_id, position_id) VALUES (?, ?, ?, ?)";
        values = [req.body.characterNameInput, req.body.movieIdInput, req.body.personIdInput, req.body.positionIdInput];
    }
	if (sqlReq) {
        conn.query(sqlReq, values, (err, sqlRes) => {
			if (err) {
                console.error("Error inserting data:", err);
			} else {
				console.log("Data inserted:", sqlRes);
                res.redirect("/eestifilm/tegelased");
            }
		});
	} else {
		console.log("error");
	}
};

//@desc relations to person in other movies
//@route GET /api/movies
//@access private

const movieRelations = (req, res)=>{
	console.log(req.params.id);
	res.render("relations");
}

//@desc add relations of person to other movies
//@route GET /api/movies
//@access private

const addRealtion = (req, res)=>{
	//kasutades async modulit, panen mitu andmebaasipäringut paraleelselt toimima
	//loon SQL päringute(lausa tegevuste ehk funktsioonide) loendi
	const myQueries = [
		function(callback){
			conn.execute("SELECT id, first_name, last_name, birth_date FROM person", (err, result)=>{
				if(err){
					return callback(err);
				} else {
					return callback(null, result);
				}
			});
		},
		function(callback){
			conn.execute("SELECT id, title, production_year FROM movie", (err, result)=>{
				if(err){
					return callback(err);
				} else {
					return callback(null, result);
				}
			});
		},
		function(callback){
			conn.execute("SELECT id, position_name FROM position", (err, result)=>{
				if(err){
					return callback(err);
				}
				else {
					return callback(null, result);
				}
			});
		}
	];
	//paneme need tegevused paraleelselt tööle, tulemuse saab siis, kui kõik tehtud
	//väljundiks üks koondlist
	asyn.parallel(myQueries, (err, results)=>{
		if(err){
			throw err;
		} else {
			console.log(results);
			res.render("addrelations", {personList: results[0], movieList: results[1], positionList: results[2]});
		}
	});
};

module.exports = {
	movieHome,
	movieCharacters,
	addMovieInfo,
	addingMovieInfo,
	movieRelations,
	addRealtion
};