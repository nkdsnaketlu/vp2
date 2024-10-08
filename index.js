const express = require("express");
const dateTime = require("./datetime");
const fs = require("fs");
//et saada kõik päringust kätte
const bodyparser = require("body-parser");

const app = express();

//määran view mootori
app.set("view engine", "ejs");
//määran jagatavate, avalike failide kausta
app.use(express.static("public"));
//kasutame body-parser päringute parsimiseks (kui ainult teks, siis false, kui ka pildid jms, siis true)
app.use(bodyparser.urlencoded({extended: false}));

app.get("/", (req, res)=>{
	//res.send("ekspress läks käima");
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

///app.post("/visitlog"), (req, res)=>{
//};

app.listen(5216);