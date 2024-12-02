const express = require("express");
const dateTime = require("./datetime");
const fs = require("fs");
//et saada kõik päringust kätte
const bodyparser = require("body-parser");
//andmbaasi andmed
const dbInfo = require("../../vp2024config");
//andmebaasiga suhtlemine
const mysql = require("mysql2");
//fotode ülelaadimiseks
const multer = require("multer");
//fotode manipilatsiooniks
const sharp = require("sharp");
//paroolide krüpteerimiseks
const bcrypt = require("bcrypt");
//sessioonihaldur
const session = require("express-session");
//asünkroosuse võimaldaja
const asyn = require("async");

const app = express();

//määran view mootori
app.set("view engine", "ejs");
//määran jagatavate, avalike failide kausta
app.use(express.static("public"));
//kasutame body-parser päringute parsimiseks (kui ainult teks, siis false, kui ka pildid jms, siis true)
app.use(bodyparser.urlencoded({extended: true}));
//seadistamine fotodeüleslaadimiseks vahevara (middleware), mis määrab kataloogi, kuhu laetakse
const upload = multer({dest: "./public/gallery/foto"});
//sessionihaldur
app.use(session({secret: "secretKey", saveUninitialized: true, resave: true}));
//let mySession;

//loon andmbaasi ühenduse
const conn = mysql.createConnection({
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
}); //conn - connection

//uudiste osa eraldi ruuteriga
const newsRouter = require("./routes/newsrouter");
app.use("/news", newsRouter);

const wheatherRouter = require("./routes/wheaterrouter");
app.use("/wheather", wheatherRouter);

const moviesRouter = require("./routes/moviesrouter");
app.use("/eestifilm", moviesRouter);

app.get("/", (req, res)=>{
	//res.send("ekspress läks käima");
	//console.log(dbInfo.configData.host);
	let sqlReq = "SELECT news_title, news_text FROM vpnews ORDER BY RAND() LIMIT 1";
	news = [];
	//res.send("ekspress läks käima");
	//console.log(dbInfo.configData.host);
	conn.execute(sqlReq, (err, sqlRes)=>{
		if(err){
			console.log(err);
			res.render("index", {news: []});
		} else {
			console.log(sqlReq);
			console.log(sqlRes);
			res.render("index", {news: sqlRes});
		}
	});
	//res.render("index");
});

app.post("/", (req, res)=>{
	let notice = null;
	if(!req.body.emailInput || !req.body.passwordInput){
		console.log("Andmed pole korrektsed");
		notice = "Sisselogimise andmeid on puudu!";
		res.render("index", {notice: notice});
	} else {
		let sqlReq = "SELECT id,password FROM vp_users WHERE email = ?";
		conn.execute(sqlReq, [req.body.emailInput], (err, result)=>{
			if(err){
				notice = "tehnilise veo tõttu ei saa sisse logida";
				console.log(err);
				res.render("index", {notice: notice});
			} else {
				if(result[0] != null){
					//kontrolime kas sisseloogimisel sisestatud paroolist saaks sellise räsi nagu andmebaasis
					bcrypt.compare(req.body.passwordInput, result[0].password, (err, compareresult)=>{
						if(err){
							notice = "tehnilise veo tõttu andmete kontrollimisel ei saa sisse logida";
							console.log(err);
							res.render("index", {notice: notice});
						} else {
							//kui võrdluse tulemus on positiivne
							if(compareresult){
								notice = "Oledki sisseloginud!";
								//võtame sessioni kasutusele
								//mySession = req.session;
								//mySession.userId = result[0].id;
								//res.render("index", {notice: notice});
								req.session.userId = result[0].id;
								res.redirect("/home");
							} else {
								notice = "Kasutajatunnus ja/või parool oli vale";
								res.render("index", {notice: notice});
							}
						}
					});
				} else {
					notice = "Kasutajatunnus või parool oli vale";
					res.render("index", {notice: notice});
				}
			}
		});
	}
	//res.render("index");
});

app.get("/home", (req, res)=>{
	console.log("Sisse on loginud kasutaja: "+ req.session.userId);
	res.render("home");
});

app.post("/home", (req, res)=>{
	res.render("home");
});

app.get("/logout", (req, res) =>{
	req.session.destroy();
	//mySession = null;
	res.redirect("/");
});

app.get("/signup", (req, res)=>{
	res.render("signup");
});

app.post("/signup", (req, res)=>{
	let notice = "Ootan andmeid";
	if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.birthDateInput || !req.body.genderInput || !req.body.emailInput || !req.body.passwordInput || req.body.passwordInput.lenght < 8 || req.body.passwordInput !== req.body.confirmPasswordInput){
		console.log("Andmed on puudu või parool ei sobi");
		notice = "Andmed on puudu või parool ei sobi";
	}
	else{
		notice = "Andmed korras";
		bcrypt.genSalt(10, (err, salt)=>{
			if (err){
				notice = "Tehniline viga, kasutajat ei loodud.";
				res.render("signup", {notice: notice});
			} else {
				bcrypt.hash(req.body.passwordInput, salt, (err, pwdHash)=>{  //hash -  функция, преобразующая массив входных данных произвольного размера в выходную битовую строку определённого (установленного) размера в соответствии с определённым алгоритмом
					if (err){
						notice = "Tehniline viga, kasutajat ei loodud.";
						res.render("signup", {notice: notice});
					} else {	
						let sqlReq = "SELECT id FROM vp_users WHERE email = ?";
						conn.execute(sqlReq, [req.body.emailInput], (err, result)=>{
							if (result[0] != null) {
							console.log("Email on juba registreeritud");
							birthDay = req.body.birthDateInput;
							firstName = req.body.firstNameInput;
							lastName = req.body.lastNameInput;
							emailIn = req.body.emailInput
							notice = req.body.emailInput +" on juba registreeritud";
							res.render("signup", {notice: notice, firstName: firstName, lastName: lastName, emailIn: emailIn, birthDay: birthDay});
							} else {
								let sqlReq = "INSERT INTO vp_users (first_name, last_name, birth_date, gender, email, password) VALUES (?, ?, ?, ?, ?, ?)";
								conn.execute(sqlReq, [req.body.firstNameInput, req.body.lastNameInput, req.body.birthDateInput, req.body.genderInput, req.body.emailInput, pwdHash], (err, result)=>{
								if (err) {
									notice = "Tehniline viga andmebaasilise kirjutamisel, kasutajat ei loodud.";
									res.render("signup", {notice: notice});
								} else {
									notice = "Kasutaja " + req.body.emailInput + " on edukalt loodud";
									res.render("signup", {notice: notice});
								}
							});
							}
						});
					}
				});
			}
		});
	};
		//res.render("signup", {notice: notice});
});

app.get("/timenow", (req, res)=>{
	const weekdayNow = dateTime.weekDayEt();
	const dateNow = dateTime.dateFormattedEt();
	const timeNow = dateTime.timeFormattedEt();
	res.render("timenow", {nowWD: weekdayNow, nowD: dateNow, nowWT: timeNow});
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

app.get("/gallery", (req, res)=>{
	res.render("gallery");
});

app.post("/gallery", (req, res)=>{
	res.render("gallery");
});

app.get("/gallery/photoupload", (req, res)=>{
	res.render("photoupload");
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

/*app.post("/gallery/photoupload", upload.single("photoInput"), (req, res)=>{
	console.log(req.body);
	console.log(req.file);
	const fileName = "vp_" + Date.now() + ".jpg";
	fs.rename(req.file.path, req.file.destination + "/" + fileName, (err)=>{
		console.log("Faili nime muutmise viga: " + err);
	});
	sharp(req.file.destination + "/" + fileName).resize(800,600).jpeg({quality: 90}).toFile("./public/gallery/normal/" + fileName);
	sharp(req.file.destination + "/" + fileName).resize(100,100).jpeg({quality: 90}).toFile("./public/gallery/thumb/" + fileName);
	//salvestame info andmebaasi
	let sqlReq = "INSERT INTO fotod (file_name, orig_name, alt_text, privacy, user_id) VALUES(?,?,?,?,?)";
	const userId = 1;
	conn.query(sqlReq, [fileName, req.file.originalname, req.body.altInput, req.body.privacyInput, userId], (err, result)=>{
		if(err){
			throw(err);
		}
		else {
			res.render("photoupload");
		}
	});
	
});

app.get("/gallery/photos", (req, res)=>{
	let sqlReq = "SELECT id, file_name, alt_text FROM fotod WHERE privacy = ? AND deleted IS NULL ORDER BY id DESC";
	const privacy = 3;
	let photoList = [];
	conn.execute(sqlReq, [privacy], (err, result)=>{
		if(err){
			throw err;
		}
		else {
			console.log(result);
			for(let i = 0; i < result.length; i ++) {
				photoList.push({id: result[i].id,  href: "/gallery/thumb/", filename: result[i].file_name, alt: result[i].alt_text});
			}
			res.render("photos", {listData: photoList});
		}
	});
	//res.render("gallery");
});*/

//uudiste osa on eraldi ruuteriga

app.post("/gallery/photos", (req, res)=>{
	res.render("photos");
});

function checkLogin(req, res, next){
	if(req.session != null){
		if(req.session.userId){
			console.log("Login ok!");
			next();
		} else {
			console.log("Login not detected!");
			res.redirect("/");
		}
	} else {
		res.redirect("/");
	}
}

const photoupRouter = require("./routes/photouprouter");
app.use("/photoupload", photoupRouter);

const galleryRouter = require("./routes/galleryrouter");
app.use("/gallery", galleryRouter);

app.listen(5216);