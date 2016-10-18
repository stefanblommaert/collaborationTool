var express = require("express");
var bodyparser = require("body-parser");
var app = express();
var request = require("request");
app.use(bodyparser.json());

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Headers", "Origin, X-requested-With, Content-Type, Accept");
	next();
});

var path = require("path");
app.use(express.static(__dirname + "/"));

app.get("/", function(req,res){
	res.sendFile( __dirname + "/" + "navbar.html");
});

var rooms = [
	{ klas : 'test1', leraar : 'test1', tittel : 'test1', code : 'test1'},
	{ klas : 'test2', leraar : 'test2', tittel : 'test2', code : 'test2'}
];
app.get("/getRooms",function(req,res) {
	res.json(rooms);
	console.log('rooms werden gestuurd');
	});
app.post("/form",function(req,res){ 
	if (req.body.klas == "" || req.body.leraar == "" || req.body.tittel == "" || req.body.code == "") {
		res.statusCode = 400;
		return res.send('error 400: post syntax incorrect');
	} 
		
	var newRoom = {
	klas : req.body.klas,
	leraar : req.body.leraar,
	tittel : req.body.tittel,
	code : req.body.code
	};

	rooms.push(newRoom);
	console.log("received booking");
	console.log(rooms);
	res.json(true);

	var stringRooms = JSON.stringify(rooms);

	fs = require('fs');
	fs.writeFile('rooms.txt', stringRooms, function (err) {
  	if (err) return console.log(err);
  	console.log('rooms werd opgeslagen');
	});
});

app

app.listen(3000);
