const mysql = require("mysql2");
const dbInfo = require("../../../vp2024config");
const asyn = require("async");
const conn = mysql.createConnection({
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
});

//@desc home page for news section
//@route GET /api/news
//@access private

const newsHome = (req, res)=>{
	res.render("news");
};

//@desc home page for adding news
//@route GET /api/news
//@access private

const addNews = (req, res)=>{
	res.render("addnews");
};

//@desc adding news
//@route GET /api/news
//@access private

const addingNews = (req, res)=>{
	if(!req.body.titleInput || !req.body.contentInput || !req.body.expireInput){
		console.log('Uudisega jama');
		notice = 'Andmeid puudu!';
		res.render('addnews', {notice: notice});
	}
	else {
		let sql = 'INSERT INTO vpnews (news_title, news_text, expire_date, user_id) VALUES(?,?,?,?)';
		conn.execute(sql, [req.body.titleInput, req.body.contentInput, req.body.expireInput, req.session.userId], (err, result)=>{
			if(err) {
				throw err;
				notice = 'Uudise salvestamine ebaأµnnestus!';
				res.render('addnews', {notice: notice});
			} else {
				notice = 'Uudis edukalt salvestatud!';
				res.render('addnews', {notice: notice});
			}
		});
	}
};

//@desc late news
//@route GET /api/news
//@access private

const newsList = (req, res)=>{
	let sqlReq = "SELECT id, news_title, news_text, news_date FROM vpnews";
	//let newsL = [];
	conn.query(sqlReq, (err, sqlRes)=>{
		if(err){
			res.render("newsList", {newsL: []});
		} else {
			console.log(sqlRes);
			res.render("newsList", {newsL: sqlRes});
		}
	});
};

//@desc read news
//@route GET /api/news
//@access private

const getNews = (req, res)=>{
	console.log(req.params.id);
	let sqlReq = "SELECT news_title, news_text, news_date, first_name, last_name FROM vp_users JOIN vpnews ON vp_users.id=vpnews.user_id WHERE vpnews.id=?";
	//let sqlReq = "SELECT news_title, news_text, news_date, first_name, last_name FROM vpnews WHERE vpnews.id=?";
	//news = [];
	let id = req.params.id;
	if (!req.params.id) {
        return res.status(400).send("ID новости не указан");
    } else {
		conn.execute(sqlReq, [id.slice(3)], (err, sqlRes) => {
			if (err) {
                console.error("Error:", err);
				res.render("readnews", {news: []});
			} else {
				console.log(sqlReq);
				console.log(sqlRes);
                res.render("readnews", {news: sqlRes});
            }
		});
	};
	
	//res.render("readNews");
};

module.exports = {
	newsHome,
	addNews,
	addingNews,
	newsList,
	getNews
};