const express = require("express");
const app = express();

app.get("/", (req, res)=>{
	res.send("ekspress läks käima");
});

app.listen(5216);