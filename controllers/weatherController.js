const axios = require("axios");
const {XMLParser} = require("fast-xml-parser");
//@desc home page for weather section
//@route GET /api/weather
//@access public

const weatherHome = (req, res)=>{
	axios.get("https://www.ilmateenistus.ee/ilma_andmed/xml/forecast.php")
	.then(response => {
		//console.log("Alustuseks: " + response);
		const parser = new XMLParser();
		let weatherData = parser.parse(response.data);
		//console.log(weatherData);
		//console.log(weatherData.forecasts);
		console.log(weatherData.forecasts.forecast[0]);
		//let thing = weatherData.forecasts.forecast[0];
		console.log(weatherData.forecasts.forecast[0].day.text);
		res.render("wheather");
	})
	.catch(error => {
		console.log(error);
		res.render("wheather");
	});
	//res.render("wheather");
};


module.exports = {
	weatherHome};