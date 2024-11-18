const mysql = require("mysql2");
const dbInfo = require("../../../vp2024config");
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

//@desc read news
//@route GET /api/news
//@access private

const newsList = (req, res)=>{
	let sqlReq = "SELECT news_title, news_text, news_date FROM vpnews";
	let newsL = [];
	conn.query(sqlReq, (err, sqlRes)=>{
		if(err){
			res.render("readnews", {newsL: []});
		} else {
			console.log(sqlRes);
			res.render("readnews", {newsL: sqlRes});
		}
	});
};

module.exports = {
	newsHome,
	addNews,
	addingNews,
	newsList
};