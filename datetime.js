const weekdayNamesEt = ["Pühapäev", "Esmaspäev", "Teisipäev", "Kolmapäev", "Neljapäev", "Reede", "Laupäev"];
const monthNamesEt = ["jaanuar", "veebruar", "märts", "aprill", "mai", "juuni", "juuli", "august", "september", "oktoober", "november", "detsember"]; //list = massiv

const dateFormatted = function(){

//function dateFormatted(){
	let timeNow = new Date(); 
	let dateNow = timeNow.getDate();
	let monthNow = timeNow.getMonth();
	let yearNow = timeNow.getFullYear();
	//console.log("täna on " + dateNow + "." + (monthNow + 1) + "." + yearNow);
	//console.log("täna on " + dateNow + " " + (monthNamesEt[monthNow]) + " " + yearNow);
	//let dateEt = (weekdaysNamesEt[weekdayNow]) + " " + dateNow + "." + (monthNamesEt[monthNow]) + " " + yearNow;
	//return dateEt; //tagasta
	return dateNow + "." + (monthNamesEt[monthNow]) + " " + yearNow;
}

const weekDay = function(){
	let timeNow = new Date();
	let dayNow = timeNow.getDay();
	return weekdayNamesEt[dayNow];
}

const timeFormatted = function(){
	let timeNow = new Date();
	let hourNow = timeNow.getHours();
	let minuteNow = timeNow.getMinutes();
	let secondNow = timeNow.getSeconds();
	return hourNow + ":" + minuteNow + ":" + secondNow;
}

const dayPart = function(){
	let dayPart = "suvaline aeg";
	let hourNow = new Date().getHours();
	let dayNow = new Date().getDay();
	// OR || AND &&
	// <    >   >=   <==   !=   ==   ===same typt
	if(hourNow > 8 && hourNow < 16 && dayNow > 0 && dayNow < 6){
		dayPart = "kooliaeg";
	} else if (hourNow >= 23 || hourNow < 7 && dayNow > 0 && dayNow < 6) {
		dayPart = "uniaeg";
	} else if (hourNow >= 16 && hourNow <= 18 && dayNow == 4){
		dayPart = "gym";
	} else if (dayNow == 6 || dayNow == 0  ) {
		dayPart = "puhkepäev";
	} else if (dayNow == 6 && hourNow > 18 && hourNow <= 21 ) {
		dayPart = "kodunetöö";
	} else {
		dayPart = "puhkeaeg";
	}
	return dayPart;
}

// ekspordin kõik vajaliku
module.exports = {dateFormattedEt: dateFormatted, weekDayEt: weekDay, timeFormattedEt: timeFormatted, weekdayNames: weekdayNamesEt, monthNames: monthNamesEt, dayPart:dayPart};