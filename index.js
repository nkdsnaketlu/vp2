const express = require("express");
const dateTime = require("./datetime");
const fs = require("fs");
//et saada kõik päringust kätte
const bodyparser = require("body-parser");
//andmbaasi andmed
const dbInfo = require("../../vp2024config");
//andmebaasiga suhtlemine
const mysql = require("mysql2");

const app = express();

//määran view mootori
app.set("view engine", "ejs");
//määran jagatavate, avalike failide kausta
app.use(express.static("public"));
//kasutame body-parser päringute parsimiseks (kui ainult teks, siis false, kui ka pildid jms, siis true)
app.use(bodyparser.urlencoded({extended: false}));

//loon andmbaasi ühenduse
const conn = mysql.createConnection({
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
}); //conn - connection

app.get("/", (req, res)=>{
	//res.send("ekspress läks käima");
	//console.log(dbInfo.configData.host);
	res.render("index");
});

app.get("/timenow", (req, res)=>{
	const weekdayNow = dateTime.weekDayEt();
	const dateNow = dateTime.dateFormattedEt();
	const timeNow = dateTime.timeFormattedEt();
	res.render("timenow", {nowWD: weekdayNow, nowD: dateNow, nowWT: timeNow});
});

app.get("/vanasonad", (req, res)=>{
	let folkWisdom = [];
	fs.readFile("public/textfiles/vanasonad.txt", "utf8", (err, data)=>{
		if(err){
			//throw err;
			res.render("justlist", {h2: "Vanasonad", listData: ["Ei leidnud midagi!"]});
		}
		else {
			folkWisdom = data.split(";");
			res.render("justlist", {h2: "Vanasonad", listData: folkWisdom});
		}
	});
	
});

app.get("/regvisit", (req, res)=>{
	const weekdayNow = dateTime.weekDayEt();
	const dateNow = dateTime.dateFormattedEt();
	const timeNow = dateTime.timeFormattedEt();
	res.render("regvisit", {nowWD: weekdayNow, nowD: dateNow, nowWT: timeNow});
});

app.post("/regvisit", (req, res)=>{
	const weekdayNow = dateTime.weekDayEt();
	const dateNow = dateTime.dateFormattedEt();
	const timeNow = dateTime.timeFormattedEt();
	res.render("regvisitdb", {nowWD: weekdayNow, nowD: dateNow, nowWT: timeNow});
	//console.log(req.body);
	//avan txt faili selliselt, et kui seda pole olemas, luuakse
	fs.open("public/textfiles/log.txt", "a", (err, file) => { //"a" - append дописать
		if (err) {
			throw err;
		}
		else {
			fs.appendFile("public/textfiles/log.txt", req.body.firstNameInput + " " + req.body.lastNameInput + " " + req.body.regTime + " " + req.body.regDay + ";" + " ", (err) => {
				if (err) {
					throw err;
				}
				else {
					console.log("Faili kirjutatu!");
					res.render("regvisit");
				}
			});
		}
	});
	//res.render("regvisit");
});

app.get("/visitlog", (req, res) => {
    let logList = [];
    fs.readFile("public/textfiles/log.txt", "utf8", (err, data) => { 
        if (err) {
            res.render("logreg", {listData: ["Ei leidnud midagi!"]});
        } else {
            logList = data.split(";");
            res.render("logreg", {listData: logList});
        }
    });
});

app.get("/eestifilm", (req, res) => {
	res.render("eestifilm");
});

app.get("/eestifilm/tegelased", (req, res) => {
	//loon andmbaasipäringu
	let sqlReq = "SELECT first_name, last_name, birth_date FROM person";
	conn.query(sqlReq, (err, sqlRes)=>{
		if(err){
			res.render("tegelased", {persons: []});
		}
		else {
			console.log(sqlRes);
			res.render("tegelased", {persons: sqlRes});
		}
	});
});

app.get("/regvisitdb", (req, res)=>{
	let notice = "";
	let firstName = "";
	let lastName = "";
	res.render("regvisitdb", {notice: notice, firstName: firstName, lastName: lastName});
});

app.post("/regvisitdb", (req, res)=>{
	let notice = "";
	let firstName = "";
	let lastName = "";
	//kontrollin kas kõik vajalikku andmed on olemas
	if(!req.body.firstNameInput || ! req.body.lastNameInput){
		//console.log("Osa andmeid puudu!");
		notice = "Osa andmeid puudu!";
		firstName = req.body.firstNameInput;
		lastName = req.body.lastNameInput;
		res.render("regvisitdb", {notice: notice, firstName: firstName, lastName: lastName});
	}
	else {
		let sqlReq = "INSERT INTO visitlog (first_name, last_name) VALUES(?,?)";
		conn.query(sqlReq, [req.body.firstNameInput, req.body.lastNameInput], (err, sqlRes)=>{
			if(err){
				notice = "Tehnilistel põhjustel andmeid ei salvestatud!";
				res.render("regvisitdb", {notice: notice, firstName: firstName, lastName: lastName});
				throw err;
			}
			else {
				//notice = "Andmed salvestati!";
				//res.render("regvisitdb", {notice: notice, firstName: firstName, lastName: lastName});
				res.redirect("/");
			}
		});
	}
});

app.get("/eestifilm/lisa", (req, res)=>{
	let sqlReq = "";
	res.render("addmovieinfo");
});

app.post("/eestifilm/lisa", (req, res)=>{
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
});

app.listen(5216);